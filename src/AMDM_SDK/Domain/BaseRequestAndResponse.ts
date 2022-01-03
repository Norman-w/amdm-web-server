export namespace SDKClient
{
    export interface BaseResponse {
        ErrMsg?: string,
        ErrCode?: string,
        IsError: boolean
    }

    export interface IRequest<BaseResponse>
    {
        GetApiName():any,
    }
}