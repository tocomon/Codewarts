import Phaser from 'phaser';
import MainScene from '../scenes/Mainscene';

export default class Player extends Phaser.Physics.Matter.Sprite {
  socketId!: string;
  playerTexture!: string;
  touching!: any[];
  inputKeys!: any;
  showingIcon!: any;
  spriteIcon!: any;
  buttonEditor!: any;

  constructor(data: any) {
    let { scene, x, y, texture, id, frame } = data;

    super(scene.matter.world, x, y, texture, id, frame);

    this.socketId = id;
    this.playerTexture = texture;
    this.touching = [];
    this.scene.add.existing(this); // 플레이어 객체가 생기는 시점.

    // const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const Body = this.scene.matter.body;
    const Bodies = this.scene.matter.bodies;
    let playerCollider = Bodies.circle(this.x, this.y, 20, {
      isSensor: false,
      label: 'playerCollider',
    });
    let playerSensor = Bodies.circle(this.x, this.y, 30, {
      isSensor: true,
      label: 'playerSensor',
    });
    const compoundBody = Body.create({
      parts: [playerCollider, playerSensor],
      frictionAir: 0.35,
    });
    // this.CreateCollisions(playerSensor);
    this.setExistingBody(compoundBody);
    this.setFixedRotation();
  }

  static preload(scene: any) {
    scene.load.atlas(
      'male1',
      'assets/images/villager-males.png',
      'assets/images/male1.json'
    );
    for (let i = 0; i <= 27; i++) {
      scene.load.atlas(
        `char${i}`,
        `assets/characters/char${i}.png`,
        `assets/characters/char${i}.json`
      );
    }
  }

  get velocity() {
    return this.body.velocity;
  }

  update() {
    // if (this.buttonEditor) {
    //   this.buttonEditor.setPosition(this.x, this.y); // 버튼 위치 업데이트 시켜주는 것
    // }

    // 초마다 60프레임마다(?) 호출되는 것, 매 틱마다 업데이트 되야하는 것인듯.
    const speed = 5;
    let playerVelocity = new Phaser.Math.Vector2(); //  2D 벡터
    let motion = 'idle';
    if (this.inputKeys.left.isDown) {
      playerVelocity.x = -1;
      this.anims.play(`${this.playerTexture}-walk-left`, true);
      motion = 'left';
      // this.x -= speed;
    } else if (this.inputKeys.right.isDown) {
      playerVelocity.x = 1;
      this.anims.play(`${this.playerTexture}-walk-right`, true);
      motion = 'right';
      // this.x += speed;
    }
    if (this.inputKeys.up.isDown) {
      playerVelocity.y = -1;
      if (motion === 'idle') {
        this.anims.play(`${this.playerTexture}-walk-up`, true);
        motion = 'up';
      }

      // this.y -= speed;
    } else if (this.inputKeys.down.isDown) {
      playerVelocity.y = 1;
      if (motion === 'idle') {
        this.anims.play(`${this.playerTexture}-walk-down`, true);
        motion = 'down';
      }
      // this.y += speed;
    }
    if (motion === 'idle') {
      this.anims.play(`${this.playerTexture}-idle-down`, true);
    }

    playerVelocity.normalize(); // 대각선인 경우 1.4의 속도이기 때문에 정규화(normalize)를 통해 속도를 1로 만든다. 이 주석에서 속도란, speed가 아니라 좌표 변화량을 뜻한다.
    playerVelocity.scale(speed);
    this.setVelocity(playerVelocity.x, playerVelocity.y); // 실제로 player오브젝트를 움직인다.

    const { socket } = this.scene as MainScene;
    if (!socket) {
      return;
    }
    socket.emit('movement', {
      x: this.x,
      y: this.y,
      motion: motion,
    });
    // this.spriteIcon.setPosition(this.x, this.y);
    // this.showIcon();
  }

  // CreateCollisions(playerSensor: any) {
  //   this.scene.matterCollision.addOnCollideStart({
  //     objectA: [playerSensor],
  //     callback: (other: any) => {
  //       // console.log("from player: ", other);
  //       if (other.bodyB.isSensor) return;
  //       this.touching.push(other.gameObjectB);

  //       // //button -> 이후에 resource에 생겨야한다.
  //       this.buttonEditor = new Phaser.GameObjects.Sprite(
  //         this.scene,
  //         0,
  //         0,
  //         'items',
  //         5
  //       );
  //       this.buttonEditor.setScale(0.8);
  //       this.buttonEditor.setOrigin(0, 2);
  //       this.buttonEditor.setInteractive(); // 이거 해줘야 function 들어감!!!!! 3시간 버린듯;
  //       this.scene.add.existing(this.buttonEditor);
  //       this.buttonEditor.on('pointerdown', () => console.log('ok'));

  //       console.log(this.touching.length, other.gameObjectB.name);
  //     },
  //     context: this.scene,
  //   });

  //   this.scene.matterCollision.addOnCollideEnd({
  //     objectA: [playerSensor],
  //     callback: (other: any) => {
  //       this.touching = this.touching.filter(
  //         (gameObject) => gameObject !== other.gameObjectB
  //       );
  //       if (this.buttonEditor) {
  //         this.buttonEditor.destroy();
  //       }
  //     },
  //     context: this.scene,
  //   });
  // }
}
