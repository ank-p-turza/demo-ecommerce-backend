import { RoleEnum } from "src/common/enum/role.enum";

export interface UserPayload{
    id: number;
    name: string;
    email : string;
    role: RoleEnum;
    is_verified: boolean;
    otp : string;
    otp_expires_at: Date;
    created_at : Date;
    updated_at: Date;
}
