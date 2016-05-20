module Scumbag
{
  /** this is the context in scripts are run */
  namespace ScriptContext
  {
    export let value:   number;
    export let state:   GuiState;
  }


  /** runs game scripts */
  export namespace Script
  {
    let blocks:     string[];
    let nextBlock:  number;

    /** sets the script up to go.
     * key is a key to a preloaded text file */
    export function setScript(game:Phaser.Game,key:string)
    {
      blocks = game.cache.getText(key).split('\n');
      ScriptContext.state = <GuiState>game.state.getCurrentState();
      nextBlock = 0;
      runScript(0);
    }

    /** runs the script for one block */
    export function runScript(value:number)
    {
      ScriptContext.value = value;
      let effect = new Function(blocks[nextBlock++]);
      effect.call(ScriptContext);
    }
  }
}