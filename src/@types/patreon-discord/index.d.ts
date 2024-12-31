declare module 'patreon-discord' {
    export type PatronStatus = "active_patron" | "declined_patron" | "former_patron" | null;

    export interface Patron {
        campaign_lifetime_support_cents: number;
        currently_entitled_amount_cents: number;
        discord_user_id?: string;
        currently_entitled_tier_id?: string;
        patron_status: PatronStatus;
        // ... other fields omitted for brevity
    }

    export class Campaign {
        constructor(options: {
            patreonToken: string;  // Note: Changed from patreonToken
            campaignId: string;
        });

        fetchPatrons(status: PatronStatus[]): Promise<Patron[]>;
        fetchPatron(patronId: string): Promise<Patron>;
    }
}
