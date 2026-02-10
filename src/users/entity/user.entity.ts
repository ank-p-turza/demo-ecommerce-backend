import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoleEnum } from "../../common/enum/role.enum";
import { Product } from "src/product/entity/product.entity";

@Entity('users')
export class User{
    @PrimaryGeneratedColumn({type: 'int'})
    id!: number;
    
    @Column({type : 'varchar', default: null})
    name!: string;
    
    @Column({unique: true})
    email!: string;
    
    @Column()
    password!: string;
    
    @Column({type: 'enum', enum: RoleEnum, nullable : false, default: RoleEnum.CUSTOMER})  
    role!: RoleEnum;
        
    @Column({default : false})
    is_verified!: boolean;
    

    @Column({nullable : true})
    otp!: string;

    @Column({ type: 'timestamptz' , nullable : true})
    otp_expires_at!: Date;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at!: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updated_at!: Date;

    @BeforeInsert()
    setExpiry() {
        const now = new Date();
        this.otp_expires_at = new Date(now.getTime() + 5 * 60 * 1000);
    }
    
    @OneToMany(()=> Product, (product)=> product.owner)
    products! : Product[];


}