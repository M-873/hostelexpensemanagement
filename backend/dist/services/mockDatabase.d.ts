interface WhereClause {
    id?: string;
    email?: string;
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
}
interface OrderByClause {
    createdAt?: 'desc' | 'asc';
    date?: 'desc' | 'asc';
    priority?: 'desc' | 'asc';
    category?: 'desc' | 'asc';
}
interface SelectClause {
    _count?: boolean;
    [key: string]: boolean | undefined;
}
interface FindUniqueParams {
    where: WhereClause;
    select?: SelectClause;
}
interface FindManyParams {
    where?: WhereClause;
    orderBy?: OrderByClause;
    select?: SelectClause;
    take?: number;
}
interface CreateParams {
    data: Record<string, unknown>;
}
interface UpdateParams {
    where: WhereClause;
    data: Record<string, unknown>;
}
interface DeleteParams {
    where: WhereClause;
}
interface AggregateParams {
    where?: WhereClause;
    _sum?: {
        amount?: boolean;
    };
}
interface GroupByParams {
    by: string[];
    where?: WhereClause;
    _sum?: {
        amount?: boolean;
    };
}
interface UpsertParams {
    where: {
        hostelId_date: {
            hostelId: string;
            date: Date;
        };
    };
    update: (params: UpdateParams) => Promise<unknown>;
    create: (params: CreateParams) => Promise<unknown>;
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
        create: ({ data }: CreateParams) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }>;
    };
    user: {
        findUnique: ({ where }: {
            where: WhereClause;
        }) => Promise<{
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            hostelId: string;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
        create: ({ data }: CreateParams) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }>;
        update: ({ where, data }: UpdateParams) => Promise<{
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            hostelId: string;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
    };
    expense: {
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: {
                toNumber: () => number;
            };
        }>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
        groupBy: ({ by, where }: GroupByParams) => Promise<{
            [key: string]: string | number;
            _sum: {
                amount: number;
            };
            _count: {
                _all: number;
            };
        }[]>;
        aggregate: ({ where, _sum }: AggregateParams) => Promise<{
            _sum: {
                amount: number;
            };
        }>;
    };
    deposit: {
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
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
        create: ({ data }: CreateParams) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: {} | null;
            priority: {};
        }>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
    };
    note: {
        findUnique: ({ where }: {
            where: WhereClause;
        }) => Promise<any>;
        findMany: ({ where, orderBy }: FindManyParams) => Promise<any[]>;
        create: ({ data }: CreateParams) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isPublic: {} | null;
            category: {};
        }>;
        update: ({ where, data }: UpdateParams) => Promise<any>;
        delete: ({ where }: DeleteParams) => Promise<any>;
    };
    $transaction: (operations: (() => Promise<unknown>)[]) => Promise<(() => Promise<unknown>)[]>;
};
export declare const initializeMockData: () => void;
export default mockDatabase;
//# sourceMappingURL=mockDatabase.d.ts.map