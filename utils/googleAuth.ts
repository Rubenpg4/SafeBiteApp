/**
 * GOOGLE AUTHENTICATION HELPER
 * Maneja el flujo de OAuth con Google usando Expo Auth Session
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Configura WebBrowser para dismisses correctos en Android
WebBrowser.maybeCompleteAuthSession();

// Web Client ID desde Firebase Console
// Este funciona para iOS, Android y Web en desarrollo con Expo
const WEB_CLIENT_ID = '856801488212-81scqu2fcjjjktn2v9da9uhg8qvss51e.apps.googleusercontent.com';

// iOS Client ID (el mismo que Web en muchos casos)
const IOS_CLIENT_ID = '856801488212-vj77r8c3i4tu5rpg6iagucvqoo66jc0i.apps.googleusercontent.com';

// Android OAuth Client ID
const ANDROID_CLIENT_ID = '856801488212-0i1sgupgqdercveg1oguq7le4mlehv8q.apps.googleusercontent.com';

// Endpoints de Google OAuth
const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Prompt para Google Sign-In
 * Abre el navegador, gestiona OAuth, devuelve ID Token
 * @returns ID Token de Google para usar con Firebase
 */
export const promptGoogleSignIn = async (): Promise<string> => {
    try {
        console.log('[GoogleAuth] Iniciando Google Sign-In...');

        // Usar AMBOS redirect URIs: el proxy de Expo Y el esquema nativo
        const proxyRedirectUri = `https://auth.expo.io/@rubenpg4/SafeBite_App`;
        const nativeRedirectUri = AuthSession.makeRedirectUri({
            scheme: 'safebiteapp',
        });

        console.log('[GoogleAuth] Proxy Redirect URI:', proxyRedirectUri);
        console.log('[GoogleAuth] Native Redirect URI:', nativeRedirectUri);

        // Generar nonce para seguridad (requerido por Google para ID tokens)
        const nonce = Math.random().toString(36).substring(2, 15);

        // Configurar request OAuth con Web Client ID
        // Usar el proxy redirect para que Google lo acepte
        const authRequest = new AuthSession.AuthRequest({
            clientId: WEB_CLIENT_ID, // Web Client ID funciona con Expo
            scopes: ['openid', 'profile', 'email'],
            redirectUri: proxyRedirectUri, // Usar proxy para que Google lo acepte
            responseType: AuthSession.ResponseType.IdToken,
            usePKCE: false,
            extraParams: {
                nonce, // Añadir nonce para ID token
            },
        });

        // Abrir navegador para autenticación en modo nativo
        const result = await authRequest.promptAsync(discovery, {
            preferEphemeralSession: true, // No guardar sesión entre requests
        });

        console.log('[GoogleAuth] Resultado:', result.type);

        if (result.type === 'success') {
            console.log('[GoogleAuth] Result params:', JSON.stringify(result.params || {}, null, 2));
        }

        if (result.type !== 'success') {
            throw new Error(`OAuth falló: ${result.type}`);
        }

        // Extraer el ID Token
        const idToken = result.params.id_token;
        if (!idToken) {
            console.error('[GoogleAuth] No hay ID token en params:', result.params);
            throw new Error('No se recibió ID token de Google');
        }

        console.log('[GoogleAuth] ✅ Autenticación exitosa');
        return idToken;

    } catch (error) {
        console.error('[GoogleAuth] Error:', error);
        throw error;
    }
};
