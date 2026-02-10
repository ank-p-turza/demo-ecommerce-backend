import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "src/common/enum/role.enum";

export const ROLES_KEY = 'roles';
export const Roles = (...roles : RoleEnum[])=>{
    return SetMetadata(ROLES_KEY, roles);
}