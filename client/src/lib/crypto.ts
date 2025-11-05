export type TCrypt = {
    content: string;
    iv: string;
    authTag: string;
}

export async function generateChatKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256
        },
        true, // extractable - должен быть true для экспорта/импорта
        ['encrypt', 'decrypt']
    );
}

// Создание нового чата с шифрованием ключа
export async function createNewChat(password: string): Promise<{
    symmetricKey: CryptoKey;
    encryptedKeyData: string;
}> {
    const symmetricKey = await generateChatKey();
    const encryptedKeyData = await encryptChatKey(symmetricKey, password);

    return {
        symmetricKey,
        encryptedKeyData
    };
}

export async function decryptChatKey(encryptedKeyData: string, password: string): Promise<CryptoKey> {
    try {
        const data = JSON.parse(encryptedKeyData);


        // Преобразуем данные из base64
        const salt = Uint8Array.from(atob(data.salt), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
        const encryptedKey = Uint8Array.from(atob(data.encryptedKey), c => c.charCodeAt(0));

        // const salt = data.salt;
        // const iv = data.iv
        // const encryptedKey = data.encryptedKeyData;

        // Создаем ключ из пароля
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        // Производный ключ для расшифровки
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        // Расшифровываем ключ чата
        const decryptedKey = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            derivedKey,
            encryptedKey
        );

        // Импортируем симметричный ключ для AES-GCM
        return await crypto.subtle.importKey(
            'raw',
            decryptedKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    } catch (error) {
        throw new Error('Failed to decrypt chat key: invalid password or corrupted data');
    }
}

export async function encryptChatKey(symmetricKey: CryptoKey, password: string): Promise<string> {
    try {
        // Экспортируем сырые байты ключа
        const keyBytes = await crypto.subtle.exportKey('raw', symmetricKey);

        // Генерируем случайную соль
        const salt = crypto.getRandomValues(new Uint8Array(16));

        // Генерируем случайный IV
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Создаем ключ из пароля
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        // Производный ключ для шифрования
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );

        // Шифруем ключ чата
        const encryptedKey = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            derivedKey,
            keyBytes
        );

        // Формируем результат
        const result = {
            salt: btoa(String.fromCharCode(...salt)),
            iv: btoa(String.fromCharCode(...iv)),
            encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey)))
        };

        return JSON.stringify(result);

    } catch (error) {
        throw new Error('Failed to encrypt chat key: ' + error);
    }
}

export async function encryptMessage(content: string, key: CryptoKey): Promise<TCrypt> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    );

    // Разделяем зашифрованные данные и auth tag
    const encryptedContent = encrypted.slice(0, encrypted.byteLength - 16);
    const authTag = encrypted.slice(encrypted.byteLength - 16);

    return {
        content: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
        iv: btoa(String.fromCharCode(...iv)),
        authTag: btoa(String.fromCharCode(...new Uint8Array(authTag)))
    };
}

export async function decryptMessage(encryptedMessage: TCrypt, key: CryptoKey): Promise<string> {
    const encryptedContent = Uint8Array.from(atob(encryptedMessage.content), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedMessage.iv), c => c.charCodeAt(0));
    const authTag = Uint8Array.from(atob(encryptedMessage.authTag), c => c.charCodeAt(0));

    // Объединяем данные и auth tag
    const encryptedData = new Uint8Array(encryptedContent.length + authTag.length);
    encryptedData.set(encryptedContent);
    encryptedData.set(authTag, encryptedContent.length);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}