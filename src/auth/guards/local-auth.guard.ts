import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
// may later customize the guard
export class LocalAuthGuard extends AuthGuard('local'){}