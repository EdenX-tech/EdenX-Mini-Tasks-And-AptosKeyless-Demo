declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
declare module '@/utils/aptosClient' {
    export function getAptosClient(): any;
}

declare module '@/hooks/useEphemeralKeyPair' {
    export function getLocalEphemeralKeyPair(nonce: string): any;
}

declare module '@/utils/aptosIndexerClient' {
    export function getaptosndexerClient(): any;
}