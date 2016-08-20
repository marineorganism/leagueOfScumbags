module Scumbag
{
  export namespace StateOfGame
  {
    /** structure of a saved game's parameteres */
    export interface StateParameters
    {
      slot:       number;
      switches:   {[name:string]:boolean};
      variables:  {[name:string]:number};
      characters: string[]
      map:        string;
      playerKey:  string;
      actors:     {name:string,x:number,y:number}[],
      score:      number,
      time:       number
    }


    /** the game's persistent state */
    export let parameters:StateParameters;


    export function flush()
    {
      parameters =
      {
        slot:       0,
        switches:   {},
        variables:  {},
        characters: [],
        map:        "",
        playerKey:  "",
        actors:     new Array<{name:string,x:number,y:number}>(),
        score:      0,
        time:       0
      };
    }


    /** save the data to the given slot */
    export function save():void
    {
      let data = JSON.stringify(parameters);
      if (typeof(Storage) !== "undefined")
      {
        localStorage.setItem("save"+parameters.slot,data);
      }
      else
      {
        console.log("I'm afraid saving won't be possible in this browser, but" +
                    " here's what it was going to save:");
        console.log(data);
      }
    }


    /** load the data from the given slot */
    export function load(slot:number):void
    {
      if (typeof(Storage) !== "undefined")
      {
        parameters = JSON.parse(localStorage.getItem("save"+slot));
      }
      else
      {
        console.log("I'm afraid loading won't be possible in this browser");
      }
      parameters.slot = slot;
    }
  }
}
