import OmeggaPlugin, { OL, PS, PC } from 'omegga';
import { diceRoll } from './src/commands';
import { PlayerData, ResourceData } from './src/interfaces';

type Config = { foo: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async init() {
    //Add basic resources to first time start
    let resourceData:ResourceData = await this.store.get("ResourceStore")
    if(resourceData == null) {
        resourceData = {
          index:[
            {name:"Wood", description:"An easy to gather, weak material", factoryName:"Lumberyard", gatherRate:"100"},
            {name:"Stone", description:"A durible material, more difficult to gather", factoryName:"Quarry", gatherRate:"20"},
            {name:"Metal", description:"A very strong material, much more difficult to gather", factoryName:"Blacksmith", gatherRate:"5"},
            {name:"Food",description:"Needed for pawns to live, easy to gather", factoryName:"Farm", gatherRate:"100"}
          ]
        }
      await this.store.set("ResourceStore",resourceData)
    }



    // MERP-Tools
    Omegga
    .on('join', async player => {
      try {
        let playerData:PlayerData = await this.store.get(player.id)
        if(playerData === null){
          playerData = {
            selectedEmpire:null,
            empires:{
              name:[],
              color:[],
              buildings:{ownership:[],name:[],amount:[]}
            }
          }
          await this.store.set(player.id,playerData)
        };
      } catch (err) {
        console.error('Error giving player starting Data', err);
      }
    })
    //Rolls a di(c)e
    .on('cmd:roll', (name: string, limit:number, amount:number, modifier:number) => {
      if(limit === undefined) limit = 20;
      if(amount === undefined|| amount <= 0) amount = 1;
      if(amount >= 10) amount = 10;
      if(modifier === undefined) modifier = 0;
      let message = `<color="ffff00">${name}</> rolled a <color="ffff00">${diceRoll(limit, amount, modifier).join('<color="ffffff">,</> ')}</> `;
      if(amount != 1) {message += `from ${amount}, ${limit} sided dice `;} else
      {message += `from a ${limit} sided die `;};
      if(modifier != 0) message += `with a modifier of ${modifier} `;
      message = message.slice(0, -1);
      message += `!`;
      this.omegga.broadcast(message);
    })
    //Creates an empire for a player
    .on('cmd:createempire', async (name: string, empireName:string) => {
      const player = Omegga.getPlayer(name);
      if(empireName === undefined) {
        Omegga.whisper(player,'<color="ffff00">/CreateEmpire</> <color="00ff00">[Empire Name]</>')
        return;
      }
      let playerData:PlayerData = await this.store.get(player.id)
      if (!playerData.empires.name.includes(empireName)) {
        playerData.empires.name.push(empireName)
        playerData.empires.color.push("ffffff")
        console.log(playerData.empires.buildings)

        playerData.selectedEmpire = empireName

        Omegga.broadcast(`${name} has created ${empireName}!`);
        Omegga.whisper(player, `Automatically switched empire identity to ${empireName}.
        to switch empires, use /switchempire [name]`);
        await this.store.set(player.id,playerData);
      } else {
        Omegga.whisper(player, `You already have an empire named ${empireName}!`)
      }
    })
    //Colors a player's empire
    .on('cmd:empirecolor', async (name: string, empireName:string, color:string) => {
      
      const player = Omegga.getPlayer(name);
      if(empireName === undefined|| color === undefined) {
        Omegga.whisper(player,`Allowed formats:
        <color="ffff00">/EmpireColor</> <color="00ff00">[Empire Name] [Color]</> - Allows you to recolor a specified empire`)
        return;
      }

      let playerData:PlayerData = await this.store.get(player.id)

      const match = color.match(
        /(?<x>-?[0-9a-f]{6})?/i
      );
      if(!match.groups.x) {
        Omegga.whisper(player, `Invalid color!`);
        return;
      }

      if (playerData.empires.name.includes(empireName)) {
        const empirePosition = playerData.empires.name.indexOf(empireName)
        playerData.empires.color[empirePosition] = color;
        Omegga.whisper(player, `<color="${playerData.empires.color[empirePosition]}"><b>${empireName}</></> has been recolored!`);
        await this.store.set(player.id,playerData);
      } else {
        Omegga.whisper(player, `You dont have an empire named ${empireName}!`);
      }
    })
    //Deletes a player's empire
    .on('cmd:deleteempire', async (name: string, empireName:string) => {
      const player = Omegga.getPlayer(name);
      if(empireName === undefined) {
        Omegga.whisper(player,`Allowed formats:
        <color="ffff00">/DeleteEmpire</> <color="00ff00">[Empire Name]</> - Deletes a specifed empire`)
        return;
      }
      let playerData:PlayerData = await this.store.get(player.id)
      if (playerData.empires.name.includes(empireName)) {
        const empirePosition = playerData.empires.name.indexOf(empireName)
        playerData.empires.name.splice(empirePosition,1);
        playerData.selectedEmpire = null;
        Omegga.whisper(player, `${empireName} has been deleted!`);
        await this.store.set(player.id,playerData);
      } else {
        Omegga.whisper(player, `You dont have an empire named ${empireName}!`);
      }
    })
    //Enables switches between a player's empires
    .on('cmd:switchempire', async (name: string, empireName:string) => {
      const player = Omegga.getPlayer(name);
      if(empireName === undefined) {
        Omegga.whisper(player,`Allowed formats:
        <color="ffff00">/SwitchEmpire</> <color="00ff00">[Empire Name]</> - Switches your empire alias a specifed empire you own`)
        return;
      }
      let playerData:PlayerData = await this.store.get(player.id)

      if (playerData.empires.name.includes(empireName)) {
        if(playerData.selectedEmpire != empireName){
          playerData.selectedEmpire = empireName;
          Omegga.whisper(player, `Switched empire identity to ${empireName}`);
          await this.store.set(player.id,playerData);
        } else {
          Omegga.whisper(player, `You already identify as ${empireName}!`);
        } 
      } else {
        Omegga.whisper(player, `You dont have an empire named ${empireName}!`);
      }
    })
    //Lists a players empires
    .on('cmd:playerinfo', async (name: string, ...user:string[]) => {
      let target:string;
      if(user[0] === undefined) {
        target = name;
      } else {
        target = user.join(' ')
      }
      const player = Omegga.getPlayer(target);
      if(player === undefined) {
        Omegga.whisper(Omegga.getPlayer(name),`Couldn't find player ${target}`)
        return;
      }
      let playerData:PlayerData = await this.store.get(player.id)
        let empireString;
        if(playerData.empires.name === null||playerData.empires.name[0] === undefined) {
          empireString = "This player has no empires!"
        } else {
          empireString = playerData.empires.name.join(', ')
        }
        Omegga.whisper(Omegga.getPlayer(name),`<size="24">${target}'s Empires</>
        <size="15">${empireString}</>`)
      
      
      }).
      //Speaking as your empire.
      on('cmd:s', async (name: string, ...args: string[]) => {
        const player = Omegga.getPlayer(name);
        if(args[0] === undefined) {
          Omegga.whisper(player,`Allowed formats:
          <color="ffff00">/S</> <color="00ff00">[Text]</> - Allows you to speak, under an empire alias`)
          return;
        }
        let playerData:PlayerData = await this.store.get(player.id)
        
        if(playerData.selectedEmpire != null|| playerData.selectedEmpire != undefined) {
          const empirePosition = playerData.empires.name.indexOf(playerData.selectedEmpire)
          Omegga.broadcast(`<b><color="${playerData.empires.color[empirePosition]}">${playerData.selectedEmpire}</></>: ${args.join(' ')}`)
          console.log(`${playerData.selectedEmpire}: ${args.join(' ')}`)
        } else {
          Omegga.whisper(player, `You dont have an empire identity selected! Use /switchempire [name] If you dont have an empire, Use /createempire [name]`);
        }
      })
      //when your data gets corrupted, or you want to clear your data
      .on('cmd:resetplayerdata', async (name: string) => {
        const player = Omegga.getPlayer(name);
        let playerData:PlayerData = await this.store.get(player.id)
        playerData = {
          selectedEmpire:null,
          empires:{
            name:[],
            color:[],
            buildings:{name:[],amount:[]}[0]
          }
        }
        Omegga.whisper(player, `Player data reset!`);
        await this.store.set(player.id,playerData)
      })
      //Resets resources to default state
      .on('cmd:resetresourcedata', async (name: string) => {
        const player = Omegga.getPlayer(name);
        if(!this.validate(name)){
          return;
        }
        
        let resourceData:ResourceData = await this.store.get("ResourceStore")
        resourceData = {
          index:[
            {name:"Wood", description:"An easy to gather, weak material", factoryName:"Lumberyard", gatherRate:"100"},
            {name:"Stone", description:"A durible material, more difficult to gather", factoryName:"Quarry", gatherRate:"20"},
            {name:"Metal", description:"A very strong material, much more difficult to gather", factoryName:"Blacksmith", gatherRate:"5"},
            {name:"Food",description:"Needed for pawns to live, easy to gather", factoryName:"Farm", gatherRate:"100"}
          ]
        }
        Omegga.whisper(player, `Resource data has been reset!`);
        await this.store.set("ResourceStore",resourceData)
      })
      //Views the list of resources the server has
      .on('cmd:resources', async (name: string) => {
        const player = Omegga.getPlayer(name);
        let resourceData:ResourceData = await this.store.get("ResourceStore")
        Omegga.whisper(player,`<color="ffff00"><size="24">Resource List</></>`)
        if(resourceData.index[0] == null) {
          Omegga.whisper(player,`<color="777777"><size="20">There are no resources!</></>`)
        }
        for(let i = 0; i <resourceData.index.length; i++) {
          Omegga.whisper(player,`<color="ffff00">${resourceData.index[i].name}</> Gather rate: <color="ffff00">${resourceData.index[i].gatherRate}</>
          <color="aaaaaa"><size="16">Requires a ${resourceData.index[i].factoryName}</></>
          <color="aaaaaa"><size="16">${resourceData.index[i].description}</></>`)
        }
        
      })
      .on('cmd:deleteresource', async (name: string, resource:string) => {
        const player = Omegga.getPlayer(name);
        if(!this.validate(name)){
          return;
        }
        if(resource === undefined) {
          Omegga.whisper(player,`Allowed formats:
          <color="ffff00">/DeleteResource</> <color="00ff00">[Resource]</> - Removes a resource from the active resource list`)
          return;
        }
        let match = -1;
        let resourceData:ResourceData = await this.store.get("ResourceStore")
        for(let i = 0; i < resourceData.index.length; i++){
          if(resourceData.index[i].name.toLowerCase() == resource.toLowerCase()) {
            match = i;
          }
        }
        if(match+1 == 0) {
          Omegga.whisper(player, `Resource ${resource} doesn't exist!`);
          return;
        }
        resourceData.index.splice(match,1);
        Omegga.whisper(player, `Resource ${resource} deleted succesfully!`);
        await this.store.set("ResourceStore",resourceData)
      })
      .on('cmd:addresource', async (name: string, resource:string, gatherInfo:string,productionType:string, ...description:string[]) => {
        const player = Omegga.getPlayer(name);
        if(!this.validate(name)){
          return;
        }
        if(resource === undefined || gatherInfo === undefined || description[0] === undefined || productionType === undefined) {
          Omegga.whisper(player,`Allowed formats:
          <color="ffff00">/AddResource</> <color="00ff00">[Resource] [Gather Rate] [Factory Type] [Description]</> - Adds a resource from the active resource list`)
          return;
        }
        let match = -1;
        let resourceData:ResourceData = await this.store.get("ResourceStore")
        for(let i = 0; i < resourceData.index.length; i++){
          if(resourceData.index[i].name.toLowerCase() == resource.toLowerCase()) {
            match = i;
          }
        }
        if(match+1 != 0) {
          Omegga.whisper(player, `Resource ${resource} already exists!`);
          return;
        }
        resourceData.index.push({name:resource,gatherRate:gatherInfo,factoryName:productionType,description:description.join(" ")});
        Omegga.whisper(player, `Resource ${resource} added succesfully!`);
        await this.store.set("ResourceStore",resourceData)
      })
      /*
      //Honest headache code, please refactor when you wake up

      .on('cmd:build', async (name: string, building:string, amount:string) => {
        const player = Omegga.getPlayer(name)
        let resourceData:ResourceData = await this.store.get("ResourceStore")
        let playerData:PlayerData = await this.store.get(player.id)
        if(playerData.selectedEmpire === null) {
          Omegga.whisper(player, `You dont have an empire identity selected! Use /switchempire [name] If you dont have an empire, Use /createempire [name]`);
          return;
        }
        const buildingIndex = []
        for(let i = 0; i < resourceData.index.length; i++){
          if (!buildingIndex.includes(resourceData.index[i].factoryName)){
            buildingIndex.push(resourceData.index[i].factoryName)
          }
        }
        if(!buildingIndex.includes(building)){
          Omegga.whisper(player,`The building ${building} doesn't exist!`)
          return;
        }
        console.log(playerData.selectedEmpire)
        console.log(playerData.empires.buildings)
        const empirePosition = playerData.empires.name.indexOf(playerData.selectedEmpire)
        
        if(!playerData.empires.buildings.name.includes(building)||!playerData.empires.buildings.ownership.includes(playerData.selectedEmpire)) {
          playerData.empires.buildings.name.push(building)
          playerData.empires.buildings.amount.push(amount)
          playerData.empires.buildings.ownership.push(playerData.selectedEmpire)
        } else {
          let filteredIndex = []
          for(let i = 0; i < playerData.empires.buildings.ownership.length; i++){
            if(playerData.empires.buildings.ownership[i] == playerData.selectedEmpire) {
              filteredIndex.push(playerData.empires.buildings.ownership[i])
            }
          }
          
          const buildingPosition = playerData.empires.buildings.name.indexOf(building)
          playerData.empires.buildings.amount[buildingPosition] += amount
        }
        
        
      });
      
      */
    return { registeredCommands: ['roll','createempire','empirecolor','deleteempire','switchempire','playerinfo','s','resetplayerdata','resetresourcedata','resources','deleteresource','addresource','build'] };
  }

  validate(speaker: string):boolean{
    const user = Omegga.getPlayer(speaker);

    if(user.getRoles().includes(this.config['authorized-role'])){
      return true;
    } 
    Omegga.whisper(user, "You are not authorized to use this command.");
    return false;
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
