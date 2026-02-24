import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../enum/transaction-status.enum';

export class IpnBodyDto {
    @ApiProperty({ description: 'Transaction status', enum: TransactionStatus, example: TransactionStatus.VALID })
    @IsString()
    @IsNotEmpty()
    status!: TransactionStatus;

    @ApiProperty({ description: 'Transaction ID', example: 'TXN123456789' })
    @IsString()
    @IsNotEmpty()
    tran_id!: string;

    @ApiProperty({ description: 'Validation ID', required: false })
    @IsString()
    @IsOptional()
    val_id?: string;

    @ApiProperty({ description: 'Transaction amount', required: false, example: '100.00' })
    @IsString()
    @IsOptional()
    amount?: string;

    @ApiProperty({ description: 'Store amount', required: false })
    @IsString()
    @IsOptional()
    store_amount?: string;

    @ApiProperty({ description: 'Currency', required: false, example: 'BDT' })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({ description: 'Currency type', required: false })
    @IsString()
    @IsOptional()
    currency_type?: string;

    @ApiProperty({ description: 'Currency amount', required: false })
    @IsString()
    @IsOptional()
    currency_amount?: string;

    @ApiProperty({ description: 'Currency rate', required: false })
    @IsString()
    @IsOptional()
    currency_rate?: string;

    @ApiProperty({ description: 'Base fair', required: false })
    @IsString()
    @IsOptional()
    base_fair?: string;


    @ApiProperty({ description: 'Bank transaction ID', required: false })
    @IsString()
    @IsOptional()
    bank_tran_id?: string;

    @ApiProperty({ description: 'Card type', required: false })
    @IsString()
    @IsOptional()
    card_type?: string;

    @ApiProperty({ description: 'Card number (masked)', required: false })
    @IsString()
    @IsOptional()
    card_no?: string;

    @ApiProperty({ description: 'Card issuer', required: false })
    @IsString()
    @IsOptional()
    card_issuer?: string;

    @ApiProperty({ description: 'Card brand', required: false })
    @IsString()
    @IsOptional()
    card_brand?: string;

    @ApiProperty({ description: 'Card issuer country', required: false })
    @IsString()
    @IsOptional()
    card_issuer_country?: string;

    @ApiProperty({ description: 'Card issuer country code', required: false })
    @IsString()
    @IsOptional()
    card_issuer_country_code?: string;

    @ApiProperty({ description: 'Transaction date', required: false })
    @IsString()
    @IsOptional()
    tran_date?: string;

    @ApiProperty({ description: 'Store ID', required: false })
    @IsString()
    @IsOptional()
    store_id?: string;

    @ApiProperty({ description: 'Verification sign', required: false })
    @IsString()
    @IsOptional()
    verify_sign?: string;

    @ApiProperty({ description: 'Verification key', required: false })
    @IsString()
    @IsOptional()
    verify_key?: string;

    @ApiProperty({ description: 'Verification sign SHA2', required: false })
    @IsString()
    @IsOptional()
    verify_sign_sha2?: string;


    @ApiProperty({ description: 'Risk level', required: false })
    @IsString()
    @IsOptional()
    risk_level?: string;

    @ApiProperty({ description: 'Risk title', required: false })
    @IsString()
    @IsOptional()
    risk_title?: string;


    @ApiProperty({ description: 'Custom value A', required: false })
    @IsString()
    @IsOptional()
    value_a?: string;

    @ApiProperty({ description: 'Custom value B', required: false })
    @IsString()
    @IsOptional()
    value_b?: string;

    @ApiProperty({ description: 'Custom value C', required: false })
    @IsString()
    @IsOptional()
    value_c?: string;

    @ApiProperty({ description: 'Custom value D', required: false })
    @IsString()
    @IsOptional()
    value_d?: string;
    
    @ApiProperty({ description: 'Error message', required: false })
    @IsString()
    @IsOptional()
    error?: string;
}