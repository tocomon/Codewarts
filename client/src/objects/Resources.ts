import Phaser from 'phaser';
import Player from './Player';
import OtherPlayer from './OtherPlayer';
import Button from './Button';
import Table from './Table';

export default class Resource extends Phaser.Physics.Matter.Sprite {
  tableSensor!: any;
  buttonEditor!: any;
  mainScene: Phaser.Scene;
  buttonToEditor!: any;
  // macbookList!: any[];

  constructor(data: any) {
    let { scene, resource, polygon, index } = data;
    super(
      scene.matter.world,
      resource.x + resource.width / 2,
      resource.y - resource.height / 2,
      resource.name
    );

    this.mainScene = scene;

    scene.add.existing(this);

    const Body = scene.matter.body;
    const Bodies = scene.matter.bodies;

    let verticeCollider = Bodies.fromVertices(this.x + 5, this.y, polygon);

    if (
      resource.name === 'table_candle' ||
      resource.name === 'painting3' ||
      resource.name === 'floor_candle'
    ) {
      verticeCollider = Bodies.fromVertices(this.x, this.y, polygon, {
        isSensor: true,
      });
    }

    /* Disable chair collision & Add chair resource table info */
    if (resource.name === 'chair_back' || resource.name === 'chair_front') {
      // Sensor
      verticeCollider = Bodies.fromVertices(this.x, this.y, polygon, {
        isSensor: true,
      });
      // Chair list
      if (index < 2) {
        scene.chairList[0].push(this);
      } else if (index < 4) {
        scene.chairList[1].push(this);
      } else if (index < 6) {
        scene.chairList[2].push(this);
      } else if (index < 8) {
        scene.chairList[3].push(this);
      } else if (index < 10) {
        scene.chairList[4].push(this);
      } else if (index < 12) {
        scene.chairList[5].push(this);
      }
    }
    this.setExistingBody(verticeCollider);

    /* Add table interaction */
    if (resource.name === 'table') {
      // @ts-ignore
      let tableCollider = Bodies.circle(this.x - 10, this.y + 10, 115, {
        isSensor: true,
        label: 'tableSensor',
      });
      // console.log();

      const compoundBody = Body.create({
        parts: [verticeCollider, tableCollider],
        frictionAir: 0.35,
      });

      scene.tableMap.set(
        compoundBody.id,
        new Table(this.mainScene, this, compoundBody.id)
      );

      this.CreateCollisions(tableCollider);
      this.setExistingBody(compoundBody);
    }

    /* Add laptop resource to table info */
    if (
      resource.name == 'macbook_front_closed' ||
      resource.name == 'macbook_back_closed'
    ) {
      if (index < 2) {
        scene.macbookList[0].push(this);
      } else if (index < 4) {
        scene.macbookList[1].push(this);
      } else if (index < 6) {
        scene.macbookList[2].push(this);
      } else if (index < 8) {
        scene.macbookList[3].push(this);
      } else if (index < 10) {
        scene.macbookList[4].push(this);
      } else if (index < 12) {
        scene.macbookList[5].push(this);
      }
    }

    this.setStatic(true);
    this.setOrigin(0.5, 0.5);
  }

  CreateCollisions(tableSensor: any) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [tableSensor],
      callback: (other: any) => {
        if (
          other.bodyB.isSensor &&
          other.bodyB.gameObject instanceof Player &&
          !(other.bodyB.gameObject instanceof OtherPlayer)
        ) {
          this.buttonEditor = new Button({
            scene: this.scene,
            x: this.x,
            y: this.y - 20,
            text: 'E를 눌러 참여하기',
            style: {
              fontSize: '20px',
              backgroundColor: 'white',
              color: 'black',
              resolution: 20,
            },
          }).getBtn();
          this.buttonEditor.setInteractive(); // 이거 해줘야 function 들어감!!!!! 3시간 버린듯;

          // 딱 하나만 볼 수 있게하기
          // @ts-ignore
          const table = this.mainScene.tableMap.get(this.body.id);
          this.mainScene.input.keyboard.on('keydown-E', () =>
            console.log(table.tableId)
          );

          //TODO: 여기에서 사용자가 키보드 누르면 상호작용 하도록 만듦
          //@ts-ignore
          this.scene.player.touching.push(this);
          // redux로 상태 바꿔서 component 보이게? Table 클래스 내의 정보 이용해서 자리별 사용 여부, user count 등 띄우기
        }
      },
      context: this.scene,
    });

    this.scene.matterCollision.addOnCollideEnd({
      objectA: [tableSensor],
      callback: (other: any) => {
        if (this.buttonEditor) {
          //@ts-ignore
          this.scene.player.touching = this.scene.player.touching.filter(
            (button: any) => button !== this
          );
          this.buttonEditor.destroy();
        }
      },
      context: this.scene,
    });
  }
}
