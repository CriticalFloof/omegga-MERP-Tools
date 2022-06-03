import { OmeggaPlayer } from "omegga";

export interface PlayerData {
    savedRolls:any[],
    selectedEmpire:string,
    empires:any[]
}

export interface ServerData {
    runLoopData:{
        countdown:number
    },
    globalData:{
        time:number
        timeScale:number,
        regionLatitiude:number, // 90 to -90
        regionMoisture:number,
        regionHumidity:number,
        regionTemperature:number,
        regionWindSpeed:number,
        worldAxisTilt:number, // 0 to 90
        
    },
    allPlayers:OmeggaPlayer[],
    defaultRolls:any[],
    resourceIndex:any[],
    buildingIndex:any[],
    startingResourceIndex:any[],
    startingBuildingIndex:any[]
}