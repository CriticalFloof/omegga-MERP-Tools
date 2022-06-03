import OmeggaPlugin, { OL, PS, PC } from 'omegga';
import Plugin from '../omegga.plugin'
import {x} from '../omegga.plugin'
import { EmpireBuilding, EmpireResource } from './classes';
import { PlayerData, ServerData } from './interfaces';
//import type  Store  from '../omegga.plugin';

//These commands being inside of a class is unnessesary, however it allows me to know where the methods comes from so it's not so bad.
export default class MERPCommands {

    static helpList(name, section, page) {
      const player = Omegga.getPlayer(name)
      if(section == undefined) {
        Omegga.whisper(player, `<size="24"><color="00ffff"> > Brickadia MERP-Tools Help Pages</></>
        <color="00ffff"> > </><color="00ff00">/helpmerptools basic</> - Basic info about the tool.
        <color="00ffff"> > </><color="00ff00">/helpmerptools advancedrolls</> - Learn how to use the advanced rolling features and it's syntax.`
        )
      } else if(section == "basic"){
        if(page == undefined|| page == "1"){
          Omegga.whisper(player, `<size="24"><color="00ffff"> > </>Help page: <color="00ff00">Basic Commands</></>
          <color="00ffff"> > </>Reset Your Stats - <color="00ff00">/resetmystats</>
          <color="00ffff"> > </>Teleport to one of the spawns - <color="00ff00">/spawn [number]</> (SOON!)
          <color="00ffff"> > </>Teleport to your designated spawn - <color="00ff00">/respawn</> (SOON!)
          <color="00ffff"> > </>Upgrade one level - <color="00ff00">/upgradepick</>
          <color="00ffff"> > </>Upgrade multiple levels - <color="00ff00">/upgradeall</> or <color="00ff00">/upgradeall [amount]</>`)
        }
      } else if(section == "advancedrolls"){
        if(page == undefined|| page == "1"){
          Omegga.whisper(player, `<size="24"><color="00ffff"> > </>Help page: <color="00ff00">Advanced Rolling</></>
          <color="00ffff"> > </>Use the command <color="00ff00">/AdvRoll [Equation]</>
          <color="00ffff"> > </>The rolling system uses d(equation) to work. example: d(10) output: rolls die that ranges from 1-10
          <color="00ffff"> > </>You can roll multiple dice using a number before d. example: 5d(10) output: rolls 5 dice that range from 1-10
          <color="00ffff"> > </>You're also allowed to add modifiers! example: d(10)+10 output: 1 die, range 11-20
          <color="00ffff"> > </>Advanced rolling supports basic operators! example: 2*5d(50/10+10)*2 outputs: 10 dice, range 2-30
          <color="00ffff"> > </>Not using any operator inbetween data will concatenate the result. example: d(10)10 range 110-1010
          <color="00ffff"> > </>Advanced rolling also supports variables! variables come from your empires. example: d(var(empire1@resource@iron@amount))*var(empire1@building@mine@amount)
          <color="00ffff"> > </>In that example, lets say empire1 has 50 iron and 10 mines, so the result would be a range from 10-500
          <color="00ffff"> > </>If you want to view all possible varibles you have at your disposal, use <color="00ff00">/FindVariables</>
          <color="00ffff"> > </>Given the nature of how clunky variables are to type, it's reccomended that you save the roll using <color="00ff00">/SaveRoll [Roll Name][Equation]</>
          <color="00ffff"> > </>You can call these saved rolls using <color="00ff00">/UseRoll [Roll Name]</> and can delete rolls using <color="00ff00">/DeleteRoll [Roll Name]</>
          <color="00ffff"> > </>If you forget what one of your advanced rolls are called you can use <color="00ff00">/RollPresets</>`)
        }
      }
    }

    static diceRoll(name,limit,amount,modifier,silent?) {
      const player = Omegga.getPlayer(name)
      //Input Corrections
      console.log(typeof(limit))
      if(limit === undefined || limit === '') limit = 20;
      if(amount === undefined || amount === '' || amount <= 0) amount = 1;
      if(amount >= 10) amount = 10;
      if(modifier === undefined || modifier === '') modifier = 0;
      limit = parseInt(limit)
      amount = parseInt(amount)
      modifier = parseInt(modifier)
      silent = parseInt(silent)
      //Function
      let diceIndex = [];
      for(let i = 0; i < amount; i++) {
        diceIndex.push(Math.ceil(Math.random()*limit+modifier))
      };
      let message = `<color="ffff00">${name}</> rolled a <color="ffff00">${diceIndex.join('<color="ffffff">,</> ')}</> `;
      if(amount != 1) {message += `from ${amount}, ${limit} sided dice `;} else
      {message += `from a ${limit} sided die `;};
      if(modifier != 0) message += `with a modifier of ${modifier} `;
      message = message.slice(0, -1);
      message += `!`;
      if(silent == 1) {
        message = '<color="aaaaaa">[SILENT] </>'+message
        Omegga.whisper(player,message);
      } else {
        Omegga.broadcast(message);
      }
    };

    static advancedRoll(name,equation,silent?, ...args) {

      const player = Omegga.getPlayer(name);    
      let variables = equation.match(/[v][a][r][(](?<x>[^)]+)/ig)
      let paramerters = equation.match(/[a][r][g][(][)]/ig)
      console.log(variables)
      console.log(paramerters)
      //Input variables from store
      
      /*
      Variables are planned and supported, however the code to import the variables into the fuction to use isn't here yet.
      */
     globalThis.x = x

      //Converting Advanced roll syntax to Javascript syntax
      if(variables != null) {
        console.log("variable passed")
        for(let i = 0; i < variables.length; i++){
          variables[i] = variables[i].replace("var(", "")
          //Sanitize the input
          variables[i] = variables[i].replace(/[^a-z0-9_@-]/gim, "")
          
          
          const variable:string = variables[i]
          const result = eval(variable)
          
          variables[i] = variables[i].replace(variables[i], result)
          
          equation = equation.replace(/[v][a][r][(].*?[)]/i, result)
          
        }
      }
      if(paramerters != null) {
        console.log(paramerters.length)
        for(let i = 0; i < paramerters.length; i++){
          if(args[i] == null) {
            Omegga.whisper(player,"Haven't provided any arguments!")
            return;
          }
          args[i] = args[i].replace(/[^a-z0-9+*\/^.-]/gim, "")
          args[i] = eval(args[i])

          equation = equation.replace(/[a][r][g][(][)]/i, args[i])
        }
      }
      let body = equation.match(/^[^d]*.(?<x>.*)/i).groups.x
      let amount = equation.match(/^(?<x>[^d]+)/i)
      if(amount === null){
        amount = 1
      } else {
        amount = amount.groups.x
        amount.replace(/[^0-9_+*\/^.-]/gim, "")
        amount = eval(amount)
        if(amount < 1) amount = 1;
        if(amount > 10) amount = 10;
      }

      let rollEquation = body.match(/[(].*[)]/i)[0];
      //Sanitize again for good measure.
      rollEquation.replace(/[^0-9_+*\/^.-]/gim, "")
      //More conversions...
      const rollValue = eval(rollEquation)
      let diceIndex = [];
      let modValue = body.match(/[)].*/i)[0]
      modValue = modValue.replace(/[^0-9_+*\/^.-]/gim, "")
      body = body.replace(/(?<=\)).*/, '')
      //Apply modifier to roll
      for(let i = 0; i < amount; i++) {
        const rollOutput = Math.ceil(Math.random()*rollValue)
        const newBody = body.replace(/[(].*[)]/i, rollOutput)
        const evalInput = newBody+modValue
        const output = eval(evalInput)
        diceIndex.push(output)
        
      };
      //Display the results
      let message = `<color="ffff00">${name}</> rolled a <color="ffff00">${diceIndex.join('<color="ffffff">,</> ')}</> `
      if(amount != 1) {message += `from ${amount}, ${rollValue} sided dice `;} else
      {message += `from a ${rollValue} sided die `;};
      if(modValue != null&&modValue != '') {message += `with a modifier of ${modValue} `;}
      message = message.slice(0, -1);
      message += `!`;
      if(silent == 1) {
        message = '<color="aaaaaa">[SILENT] </>'+message
        Omegga.whisper(player,message);
      } else {
        Omegga.broadcast(message);
      }
      
    };

    static calcResourceChange(playerData:PlayerData,serverData:ServerData) {
      for(let i = 0; i < playerData.empires.length; i++){
        for(let j = 0; j < playerData.empires[i].buildings.length; j++){
          for(let k = 0; k < serverData.buildingIndex.length; k++){
            if(serverData.buildingIndex[k].name == playerData.empires[i].buildings[j].name){
              const buildingAmount = playerData.empires[i].buildings[j].amount
              for(let a = 0; a < serverData.buildingIndex[k].production.length; a++) {
                const resourceType = serverData.buildingIndex[k].production[a].resource
                const resourceAmount = serverData.buildingIndex[k].production[a].amount
                let netChange;
                if(serverData.globalData.timeScale < 1){
                  netChange = buildingAmount*resourceAmount*1/serverData.globalData.timeScale
                } else{
                  netChange = buildingAmount*resourceAmount
                }
                let resourceFound = false;
                for(let b = 0; b < playerData.empires[i].resources.length; b++){
                  if(resourceType == playerData.empires[i].resources[b].name){
                    playerData.empires[i].resources[b].amount += netChange
                    resourceFound = true;
                  }
                }
                if(!resourceFound){
                  for(let b = 0; b < serverData.resourceIndex.length; b++) {
                    if(serverData.resourceIndex[i].name == resourceType) {
                      playerData.empires[i].resources.push(new EmpireResource(serverData.resourceIndex[b].name,netChange))
                    }
                  }
                }
              }
            }
          }
        }
      }
      return(playerData);
    };
    static calcWeatherChange(serverData:ServerData) {
      const smoothRandom = ((Math.sin(2 * serverData.globalData.time/86400) + Math.sin(Math.PI * serverData.globalData.time/86400))*0.2+(Math.sin(10 * serverData.globalData.time/86400) + Math.sin(Math.PI * serverData.globalData.time/86400))*0.05)*0.8+0.45
      const rainSmoothRandom = ((Math.sin(2 * serverData.globalData.time/86400) + Math.sin(Math.PI * serverData.globalData.time/86400))*0.2+(Math.sin(10 * serverData.globalData.time/86400) + Math.sin(Math.PI * serverData.globalData.time/86400))*0.05)*0.8
      //console.log((rainSmoothRandom*2)*(smoothRandom)+0.15)
      let nightDayModifier;
      if(Math.floor((serverData.globalData.time%86400)/3600) >= 6 && Math.floor((serverData.globalData.time%86400)/3600) < 18) {nightDayModifier = 2} else {nightDayModifier = 1}
      const merpWeather = {
        Sky:{
          skyIntensity: 1, //Used as a correction for stormy environments being too dark.
          moonlightIntensity: 1, //Used as a correction for stormy environments being too dark.
          auroraIntensity: 0, //Gather from region latitude 90 to -90 
          weatherIntensity: (rainSmoothRandom*4)*(smoothRandom*2)-1 , //Gather from region moisture
          rainSnow: 0, //Gather from region temperature
          cloudCoverage: smoothRandom, //Gather from region moisture
          cloudSpeedMultiplier: (smoothRandom*3+1)*(1/nightDayModifier)*2, //Gather from region windspeed
          precipitationParticleAmount: smoothRandom*2, //Gather from cloud coverage and weather intensity
          windVolume: 1, //Gather from region windspeed
          clearFogDensity: (rainSmoothRandom*2)*(smoothRandom)+0.15, //Gather from region humidity
          clearFogHeightFalloff: -1*((rainSmoothRandom*2)*(smoothRandom))+2.85, //Gather from region humidity
          cloudyFogDensity: (smoothRandom*5)-2, //Gather from region humidity
          cloudyFogHeightFalloff: -1*(smoothRandom*5)+2, //Gather from region humidity
        },
        Water: {
          waterHeight: 600 //Gather from region sealevel
        }
      }
      Omegga.loadEnvironmentData(merpWeather)
    }
};
