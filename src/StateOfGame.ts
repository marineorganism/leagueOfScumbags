module Scumbag
{
  export namespace StateOfGame
  {
    /** structure of a saved game's parameteres */
    export interface StateParameters
    {
      switches:   {[name:string]:boolean};
      variables:  {[name:string]:number};
      characters: string[]
      map:        string;
      playerX:    number;
      playerY:    number;
      playerKey:  string;
      actors:     {x:number,y:number}[]
    }


    /** the game's persistent state */
    export let parameters:StateParameters =
    {
      switches:   {},
      variables:  {},
      characters: [],
      map:        "",
      playerX:    0,
      playerY:    0,
      playerKey:  "",
      actors:     new Array<{x:number,y:number}>()
    };


    /** save the data to the given slot */
    export function save(slot:number):void
    {
      let data = JSON.stringify(parameters);
      if (typeof(Storage) !== "undefined")
      {
        localStorage.setItem("save"+slot,data);
        console.log(data);
        console.log(parameters.switches);
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
    }
  }
}
