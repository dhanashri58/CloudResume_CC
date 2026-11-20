/**
 * Global API configuration.
 * Resolves the backend REST API URL:
 * - Uses VITE_API_BASE_URL if explicitly configured in environment.
 * - In production builds (Amplify / AWS cloud deployment), defaults to the live AWS Lambda Function URL.
 * - In local development (Vite dev server), defaults to '' (routed through Vite's reverse proxy to localhost:5000).
 */
export const PRODUCTION_API_URL =
  'https://dcjovytpk37z6noqf7et5nt3uq0lnrvj.lambda-url.ap-southeast-2.on.aws';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : '');

export const GOOGLE_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '1009767865628-5t95t4gimdri6omss4toejicgtq8v5vm.apps.googleusercontent.com';
