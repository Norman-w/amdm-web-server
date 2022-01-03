///<reference path = "../Domain/BaseRequestAndResponse.ts" />
///<reference path = "../Response/AccountsGetResponse.ts" />

declare namespace SDKClient
{
    export class AccountsGetRequest implements IRequest<AccountsGetResponse>
    {
        GetApiName(): any {
            return 'accounts.get';
        }

        //region 公共字段/入参集合
        /*
        要获取的字段集合,用逗号分隔
        * */
        public Fields?:string;
        public UserName?:string;
        public PasswordMD5?:string;
        public Name?:string;
        public Department?:string;
        //endregion
    }
}