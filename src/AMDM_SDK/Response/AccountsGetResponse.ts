/// <reference path = "../Domain/BaseRequestAndResponse.ts" />
declare namespace SDKClient
{
    export class AccountsGetResponse implements BaseResponse{
        public IsError;
        public Account: Account;
    }
}