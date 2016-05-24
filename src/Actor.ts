///<reference path="phaser/phaser.d.ts"/>
///<reference path="Direction.ts"/>


module Scumbag
{
  /** a fighter that will jump about and all that in the battle system */
  export class Actor extends Phaser.Sprite
  {
    moveSpeed:      number;
    angle:          number;
    tileWidth:      number;
    tileHeight:     number;
    directions:     Array<Direction>;
    targetX = -1;
    targetY = -1;
    updating = true;


    /** create it just like you would a sprite, at least at the moment.
     * TODO: It will probably need some kind of id so it can build itself from
     * some data file */
    constructor(game:Phaser.Game,x:number,y:number,key:string,tileWidth:number,
                tileHeight:number)
    {
      //run superconstructor
      super(game,x,y,key);

      //set tilesize
      this.tileWidth = tileWidth;
      this.tileHeight = tileHeight;

      //turn on physics
      this.game.physics.arcade.enable(this);
      this.body.collideWorldBounds = true;
      this.body.width = tileWidth;
      this.body.height = tileHeight;

      //do animation type crap
      this.anchor.setTo(0.5,1);
      this.animations.add('down',[0,1,2,3],10,true);
      this.animations.add('right',[4,5,6,7],10,true);
      this.animations.add('left',[8,9,10,11],10,true);
      this.animations.add('up',[12,13,14,15],10,true);

      //add controller
      this.moveSpeed = 100;

      this.directions = new Array();

      //add it to the scene
      game.add.existing(this);
    }


    /** overrides Phaser.Sprite.update() */
    update()
    {
      if (!this.updating) return;

      //if (this.directions.length == 0) return;

      let inTileX = this.body.x / this.tileWidth;
      let inTileY = this.body.y / this.tileHeight;

      let directionPoint = directionToPoint(this.directions[0]);

      //if it doesn't have a target at the moment, get one
      if (this.targetX == -1 || this.targetY == -1)
      {
        this.body.x = Math.round(inTileX) * this.tileWidth;
        this.body.y = Math.round(inTileY) * this.tileHeight;
        this.targetX = Math.round(inTileX) + directionPoint.x;
        this.targetY = Math.round(inTileY) + directionPoint.y;
      }

      this.body.velocity.x = directionPoint.x * this.moveSpeed;
      this.body.velocity.y = directionPoint.y * this.moveSpeed;

      //if it's reached it's target
      if (inTileX - this.targetX > -0.10 && inTileX - this.targetX < 0.10 &&
          inTileY - this.targetY> -0.10 && inTileY - this.targetY < 0.10)
      {
        this.changeDirection();
      }

      //set the animation right

      if (this.directions[0] == Direction.up) this.animations.play("up");
      else if (this.directions[0] == Direction.left) this.animations.play("left");
      else if (this.directions[0] == Direction.right) this.animations.play("right");
      else if (this.directions[0] == Direction.down) this.animations.play("down");
      else this.animations.stop();
    }


    /** put the actor's current direction at the end of the queue, and make it
     * move in the next direction */
    changeDirection():void
    {
      this.directions.splice(0,1);
      this.targetX = -1;
      this.targetY = -1;
    }
  }
}
