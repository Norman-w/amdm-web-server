export class Utils {
    //获取格子的位置信息
    public static GetGridLocationString = (stockIndex:number,floorIndex:number,gridIndex:number):string=>
    {
        let ret : string ='';
        let stock:number;
        let floor:number;
        let grid:number;
        if (stockIndex>=0)
        {
            stock = stockIndex +1;
        }
        else
        {
            stock = 1;
        }
        if (floorIndex>=0)
        {
            floor = floorIndex +1;
        }
        else if(floorIndex <0)
        {
            floor = floorIndex;
        }
        else
        {
            floor = 1;
        }
        if (gridIndex>=0)
        {
            grid = gridIndex+1;
        }
        else
        {
          grid =1;
        }
        ret = '第'+ stock+'仓 第'+ floor+'层 第' + grid+'槽';

        return ret;
    }
}