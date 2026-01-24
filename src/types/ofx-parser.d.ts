
declare module 'ofx-parser' {
    export interface OfxData {
        OFX: {
            BANKMSGSRSV1?: {
                STMTTRNRS?: {
                    STMTRS?: {
                        BANKTRANLIST?: {
                            STMTTRN?: any | any[];
                        };
                    };
                };
            };
        };
    }

    export function parse(xml: string): Promise<OfxData>;
}
