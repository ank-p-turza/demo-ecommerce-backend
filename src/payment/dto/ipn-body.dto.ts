import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { TransactionStatus } from '../enum/transaction-status.enum';

export class IpnBodyDto {
    @IsString()
    @IsNotEmpty()
    status!: TransactionStatus;

    @IsString()
    @IsNotEmpty()
    tran_id!: string;

    @IsString()
    @IsOptional()
    val_id?: string;

    @IsString()
    @IsOptional()
    amount?: string;

    @IsString()
    @IsOptional()
    store_amount?: string;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsString()
    @IsOptional()
    currency_type?: string;

    @IsString()
    @IsOptional()
    currency_amount?: string;

    @IsString()
    @IsOptional()
    currency_rate?: string;

    @IsString()
    @IsOptional()
    base_fair?: string;


    @IsString()
    @IsOptional()
    bank_tran_id?: string;

    @IsString()
    @IsOptional()
    card_type?: string;

    @IsString()
    @IsOptional()
    card_no?: string;

    @IsString()
    @IsOptional()
    card_issuer?: string;

    @IsString()
    @IsOptional()
    card_brand?: string;

    @IsString()
    @IsOptional()
    card_issuer_country?: string;

    @IsString()
    @IsOptional()
    card_issuer_country_code?: string;

    @IsString()
    @IsOptional()
    tran_date?: string;

    @IsString()
    @IsOptional()
    store_id?: string;

    @IsString()
    @IsOptional()
    verify_sign?: string;

    @IsString()
    @IsOptional()
    verify_key?: string;

    @IsString()
    @IsOptional()
    verify_sign_sha2?: string;


    @IsString()
    @IsOptional()
    risk_level?: string;

    @IsString()
    @IsOptional()
    risk_title?: string;


    @IsString()
    @IsOptional()
    value_a?: string;

    @IsString()
    @IsOptional()
    value_b?: string;

    @IsString()
    @IsOptional()
    value_c?: string;

    @IsString()
    @IsOptional()
    value_d?: string;
    
    @IsString()
    @IsOptional()
    error?: string;
}