///<reference path="phaser/phaser.d.ts"/>


module Scumbag
{

  const BASE_GRAVITY = 400;

  export function createFighterFromEnemy(type:string,x:number,y:number,
                                         mandatory:boolean,
                                         bulletGroup:Phaser.Group,
                                         game:Phaser.Game):Fighter
  {
    let data = Enemies.getEnemyData(type,game);
    let fighter = new Fighter(game,x,y,data.key,data.directional);

    fighter.name = type;

    fighter.controller = new Controllers[data.controller](game);
    fighter.weapons[WeaponSlot.Left] = new Weapon(game,bulletGroup,fighter,data.lWeapon);
    fighter.weapons[WeaponSlot.Right] = new Weapon(game,bulletGroup,fighter,data.rWeapon);

    fighter.maxHealth = data.health;
    fighter.health = data.health;
    fighter.healthRegenRate = data.healthRegen;
    fighter.maxMana = data.mana;
    fighter.mana = data.mana;
    fighter.manaRegenRate = data.manaRegen;

    fighter.collisionDamage = data.collisionDamage;
    fighter.body.gravity.y = BASE_GRAVITY * data.gravity;
    fighter.jumpHeight = BASE_GRAVITY * data.jump;
    fighter.moveSpeed = data.moveSpeed;

    if (fighter.moveSpeed == 0) fighter.body.immovable = true;

    fighter.deathWeapon = new Weapon(game,bulletGroup,fighter,data.deathWeapon);
    fighter.deathSound = data.deathSound;

    fighter.mandatory = mandatory;

    return fighter;
  }


  /** a fighter that will jump about and all that in the battle system */
  export class Fighter extends Phaser.Sprite
  {
    moveSpeed:      number;
    jumpHeight:     number;
    angle:          number;
    controller:     Controller;
    weapons:        Weapon[];
    deathWeapon:    Weapon;

    deathSound:     string;
    directional:    boolean;

    maxHealth:      number;
    maxMana:        number;
    mana:           number;
    healthRegenRate:number;
    manaRegenRate:  number;
    collisionDamage:number;
    canFireTime:    number;

    mandatory:      boolean;

    prevTime:       number;


    /** create it just like you would a sprite, at least at the moment.
     * TODO: It will probably need some kind of id so it can build itself from
     * some data file */
    constructor(game:Phaser.Game,x:number,y:number,key:string,directional:boolean)
    {
      //run superconstructor
      super(game,x,y,key);

      //turn on physics
      this.game.physics.arcade.enable(this);

      //make it that it dies if it leaves the world
      this.body.collideWorldBounds = true;
      this.body.onWorldBounds = new Phaser.Signal()
      this.body.onWorldBounds.add(function(){this.kill()},this);

      //do animation type crap
      if (directional)
      {
        this.animations.add('up',[0,1,2],10,true);
        this.animations.add('upright',[3,4,5],10,true);
        this.animations.add('right',[6,7,8],10,true);
        this.animations.add('downright',[9,10,11],10,true);
        this.animations.add('down',[12,13,14],10,true);
      }
      else
      {
        this.animations.add('up',null,10,true);
        this.animations.add('upright',null,10,true);
        this.animations.add('right',null,10,true);
        this.animations.add('downright',null,10,true);
        this.animations.add('down',null,10,true);
      }

      this.directional = directional;

      //make weapons array
      this.weapons = [];
      this.weapons.length = WeaponSlot.nWeaponSlots;

      this.prevTime = this.game.time.time;

      this.anchor.setTo(0.5,0.5);

      //add it to the scene
      game.add.existing(this);
    }


    update()
    {
      if (!(this.alive && this.inCamera)) return;

      //mana and health regen
      let newTime = this.game.time.time;
      let elapsedTime = newTime - this.prevTime;

      if (this.health < this.maxHealth) this.health += this.healthRegenRate;
      if (this.mana < this.maxMana) this.mana += this.manaRegenRate;

      //control the dude
      this.controller.control(this);

      //play animation if moving and if not don't

      let animationAngle = this.angle;

      if (animationAngle > Math.PI / 2 || animationAngle < 0 - Math.PI / 2)
      {
        this.scale.x = -1;

        if (animationAngle > 0) animationAngle = (animationAngle - Math.PI) * -1;
        else animationAngle = (animationAngle + Math.PI) * -1;
      }
      else
      {
        this.scale.x = 1;
      }

      if (animationAngle > (3 * Math.PI / 8)) this.animations.play('down');
      else if (animationAngle > Math.PI / 8) this.animations.play('downright');
      else if (animationAngle > 0 - Math.PI / 8) this.animations.play('right');
      else if (animationAngle > 0 - (3 * Math.PI / 8)) this.animations.play('upright');
      else this.animations.play('up');

      if (this.body.velocity.x == 0 && this.directional)
      {
        this.animations.currentAnim.stop();
      }
    }


    kill()
    {
      this.game.sound.play(this.deathSound);
      this.deathWeapon.fire(this);
      return super.kill();
    }


    move(angle:number)
    {
      this.angle = angle;
      this.body.velocity.x = this.moveSpeed * Math.cos(angle);
    }


    fly(angle:number)
    {
      this.angle = angle;
      this.body.velocity.x = this.moveSpeed * Math.cos(angle);
      this.body.velocity.y = this.moveSpeed * Math.sin(angle);
    }


    look(angle:number)
    {
      this.angle = angle;
    }


    jump()
    {
      if (this.body.blocked.down)
      {
        this.body.velocity.y = 0 - this.jumpHeight;
      }

      if (this.body.blocked.left)
      {
        this.body.velocity.x += this.jumpHeight / 2;
        this.body.velocity.y = 0 - this.jumpHeight;
      }

      if (this.body.blocked.right)
      {
        this.body.velocity.x -= this.jumpHeight / 2;
        this.body.velocity.y = 0 - this.jumpHeight;
      }
    }


    attack(slot:WeaponSlot)
    {
      let currentTime = this.game.time.time;

      if (currentTime < this.canFireTime || this.mana < this.weapons[slot].manaCost) return;
      this.weapons[slot].fire(this);
      this.canFireTime = currentTime + this.weapons[slot].wait;
      this.mana -= this.weapons[slot].manaCost;
    }
  }
}
