// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Generate a new keypair
    const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Airdrop 2 SOL to Sender wallet
    console.log("Airdropping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifier of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm the airdrop transaction using the last valid block height
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Get the balance of the sender's wallet
    const fromBalance = await connection.getBalance(new PublicKey(from.publicKey));
    console.log("Sender's balance:", fromBalance / LAMPORTS_PER_SOL, "SOL");

    // Calculate the amount to transfer (50% of the balance)
    const amountToTransfer = fromBalance / 2;

    // Send 50% of the balance from "from" wallet to "to" wallet
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: amountToTransfer
        })
    );

    // Sign and confirm the transfer transaction
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );

    console.log('Transfer completed. Amount transferred:', amountToTransfer / LAMPORTS_PER_SOL, 'SOL');
}

transferSol();
