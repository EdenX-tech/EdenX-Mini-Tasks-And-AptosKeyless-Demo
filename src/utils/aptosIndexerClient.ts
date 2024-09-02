import { IndexerClient } from "aptos";

export function getaptosndexerClient() {
    const client = new IndexerClient(
        "https://api.devnet.aptoslabs.com/v1/graphql",
    );
    return client;
}