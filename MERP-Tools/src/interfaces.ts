export interface PlayerData {
    selectedEmpire:string
    empires:{
        name:string[],
        color:string[],
        buildings:{ownership:string[],name:string[],amount:string[]}
    }
}

export interface ResourceData {
    index:{name:string,gatherRate:string,factoryName:string,description:string}[]
}