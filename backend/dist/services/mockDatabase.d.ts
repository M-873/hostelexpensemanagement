export interface WhereClause {
    id?: string;
    email?: string;
    userName?: string;
    registrationNumber?: string;
    hostelId?: string;
    isActive?: boolean;
    priority?: string;
    category?: string;
    isPublic?: boolean;
    date?: {
        gte?: Date | string;
        lte?: Date | string;
    };
    userId?: string;
    hostel?: any;
}
export interface OrderByClause {
    createdAt?: 'desc' | 'asc';
    date?: 'desc' | 'asc';
    priority?: 'desc' | 'asc';
    category?: 'desc' | 'asc';
}
export interface SelectClause {
    _count?: boolean;
    [key: string]: boolean | undefined;
}
export interface FindUniqueParams {
    where: WhereClause;
    select?: SelectClause;
    include?: any;
}
export interface FindManyParams {
    where?: WhereClause;
    orderBy?: OrderByClause;
    select?: SelectClause;
    include?: any;
    take?: number;
    skip?: number;
    distinct?: string[];
}
export interface CreateParams {
    data: any;
    include?: any;
}
export interface UpdateParams {
    where: WhereClause;
    data: any;
    include?: any;
}
export interface DeleteParams {
    where: WhereClause;
}
export interface AggregateParams {
    where?: WhereClause;
    _sum?: {
        amount?: boolean;
    };
}
export interface UserWhereInput {
    email?: string;
    id?: string;
}
export interface UserFindUniqueParams {
    where: UserWhereInput;
    include?: any;
    select?: any;
}
export interface GroupByParams {
    by: string[];
    where?: WhereClause;
    _sum?: {
        amount?: boolean;
    };
    _count?: any;
}
export interface UpsertParams {
    where: {
        hostelId_date?: {
            hostelId: string;
            date: Date;
        };
        meal_date_userId?: {
            hostelId: string;
            date: Date;
            userId: string;
        };
    };
    update: any;
    create: any;
}
export declare const mockDatabase: {
    hostel: {
        findUnique: ({ where, select }: FindUniqueParams) => Promise<{
            id: string;
            registrationNumber: string;
            name: string;
            address: string;
            phone: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        } | {
            _count: {
                users: number;
                expenses: number;
                deposits: number;
            };
            id: string;
            registrationNumber: string;
            name: string;
            address: string;
            phone: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
        findMany: () => Promise<{
            id: string;
            registrationNumber: string;
            name: string;
            address: string;
            phone: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
        create: ({ data }: CreateParams) => Promise<any>;
        findFirst: (params: any) => Promise<{
            id: string;
            registrationNumber: string;
            name: string;
            address: string;
            phone: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        } | {
            _count: {
                users: number;
                expenses: number;
                deposits: number;
            };
            id: string;
            registrationNumber: string;
            name: string;
            address: string;
            phone: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
        count: ({ where }: any) => Promise<number>;
    };
    user: {
        findUnique: ({ where, include }: UserFindUniqueParams) => Promise<{
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            hostelId: string;
            isEmailVerified: boolean;
            otp: null;
            otpExpiry: null;
            createdAt: Date;
            updatedAt: Date;
        } | {
            hostel: {
                id: string;
                registrationNumber: string;
                name: string;
                address: string;
                phone: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            hostelId: string;
            isEmailVerified: boolean;
            otp: null;
            otpExpiry: null;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
        create: ({ data }: any) => Promise<any>;
        update: ({ where, data }: UpdateParams) => Promise<{
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            hostelId: string;
            isEmailVerified: boolean;
            otp: null;
            otpExpiry: null;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
        count: ({ where }: any) => Promise<number>;
    };
    expense: {
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<any>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
        findFirst: ({ where }: any) => Promise<any>;
        count: ({ where }: any) => Promise<number>;
        groupBy: ({ by, where }: GroupByParams) => Promise<any[]>;
        aggregate: ({ where, _sum }: AggregateParams) => Promise<{
            _sum: {
                amount: number;
            };
        }>;
    };
    deposit: {
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<any>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
        findFirst: ({ where }: any) => Promise<any>;
        count: ({ where }: any) => Promise<number>;
        groupBy: ({ by, where }: GroupByParams) => Promise<any[]>;
        aggregate: ({ where, _sum }: AggregateParams) => Promise<{
            _sum: {
                amount: number;
            };
        }>;
    };
    dailyCalculation: {
        findUnique: ({ where }: {
            where: {
                hostelId_date: {
                    hostelId: string;
                    date: Date;
                };
            };
        }) => Promise<any>;
        upsert: ({ where, update, create }: UpsertParams) => Promise<any>;
    };
    noticeBoard: {
        findUnique: ({ where }: {
            where: WhereClause;
        }) => Promise<any>;
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<any>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
    };
    note: {
        findUnique: ({ where }: {
            where: WhereClause;
        }) => Promise<any>;
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<any>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
    };
    meal: {
        findMany: ({ where }: FindManyParams) => Promise<any[]>;
        upsert: ({ where, update, create }: any) => Promise<any>;
    };
    $transaction: (operations: (() => Promise<unknown>)[]) => Promise<(() => Promise<unknown>)[]>;
};
export declare const initializeMockData: () => void;
export default mockDatabase;
//# sourceMappingURL=mockDatabase.d.ts.map