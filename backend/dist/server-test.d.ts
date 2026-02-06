import { Server } from 'socket.io';
export declare const prisma: {
    hostel: {
        findUnique: ({ where, select }: import("./services/mockDatabase").FindUniqueParams) => Promise<{
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
        create: ({ data }: import("./services/mockDatabase").CreateParams) => Promise<any>;
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
        findUnique: ({ where, include }: import("./services/mockDatabase").UserFindUniqueParams) => Promise<{
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
        update: ({ where, data }: import("./services/mockDatabase").UpdateParams) => Promise<{
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
        findMany: ({ where, orderBy }: import("./services/mockDatabase").FindManyParams) => Promise<any[]>;
        create: ({ data }: import("./services/mockDatabase").CreateParams) => Promise<any>;
        update: ({ where, data }: import("./services/mockDatabase").UpdateParams) => Promise<any>;
        delete: ({ where }: import("./services/mockDatabase").DeleteParams) => Promise<any>;
        findFirst: ({ where }: any) => Promise<any>;
        count: ({ where }: any) => Promise<number>;
        groupBy: ({ by, where }: import("./services/mockDatabase").GroupByParams) => Promise<any[]>;
        aggregate: ({ where, _sum }: import("./services/mockDatabase").AggregateParams) => Promise<{
            _sum: {
                amount: number;
            };
        }>;
    };
    deposit: {
        findMany: ({ where, orderBy }: import("./services/mockDatabase").FindManyParams) => Promise<any[]>;
        create: ({ data }: import("./services/mockDatabase").CreateParams) => Promise<any>;
        update: ({ where, data }: import("./services/mockDatabase").UpdateParams) => Promise<any>;
        delete: ({ where }: import("./services/mockDatabase").DeleteParams) => Promise<any>;
        findFirst: ({ where }: any) => Promise<any>;
        count: ({ where }: any) => Promise<number>;
        groupBy: ({ by, where }: import("./services/mockDatabase").GroupByParams) => Promise<any[]>;
        aggregate: ({ where, _sum }: import("./services/mockDatabase").AggregateParams) => Promise<{
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
        upsert: ({ where, update, create }: import("./services/mockDatabase").UpsertParams) => Promise<any>;
    };
    noticeBoard: {
        findUnique: ({ where }: {
            where: import("./services/mockDatabase").WhereClause;
        }) => Promise<any>;
        findMany: ({ where, orderBy }: import("./services/mockDatabase").FindManyParams) => Promise<any[]>;
        create: ({ data }: import("./services/mockDatabase").CreateParams) => Promise<any>;
        update: ({ where, data }: import("./services/mockDatabase").UpdateParams) => Promise<any>;
        delete: ({ where }: import("./services/mockDatabase").DeleteParams) => Promise<any>;
    };
    note: {
        findUnique: ({ where }: {
            where: import("./services/mockDatabase").WhereClause;
        }) => Promise<any>;
        findMany: ({ where, orderBy }: import("./services/mockDatabase").FindManyParams) => Promise<any[]>;
        create: ({ data }: import("./services/mockDatabase").CreateParams) => Promise<any>;
        update: ({ where, data }: import("./services/mockDatabase").UpdateParams) => Promise<any>;
        delete: ({ where }: import("./services/mockDatabase").DeleteParams) => Promise<any>;
    };
    meal: {
        findMany: ({ where }: import("./services/mockDatabase").FindManyParams) => Promise<any[]>;
        upsert: ({ where, update, create }: any) => Promise<any>;
    };
    $transaction: (operations: (() => Promise<unknown>)[]) => Promise<(() => Promise<unknown>)[]>;
};
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { io };
//# sourceMappingURL=server-test.d.ts.map