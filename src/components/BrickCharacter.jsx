import baseCharacterUrl from "../assets/brick-creative-character.png";
import headphonesCharacterUrl from "../assets/pocket-capsule/character-headphones.png";
import laptopCharacterUrl from "../assets/pocket-capsule/character-laptop.png";
import bikeCharacterUrl from "../assets/pocket-capsule/character-bike.png";
import puppyCharacterUrl from "../assets/pocket-capsule/character-puppy.png";
import controllerCharacterUrl from "../assets/pocket-capsule/character-controller.png";
import coffeeCharacterUrl from "../assets/pocket-capsule/character-coffee.png";

const characterStates = {
  headphones: {
    image: headphonesCharacterUrl,
    alt: "积木风格的 Lulu 闭着眼半躺在躺椅上听头戴式耳机",
    eyebrow: "LISTENING MODE · ON",
    caption: "一起听听音乐放空身心，歇一歇，再出发。",
  },
  laptop: {
    image: laptopCharacterUrl,
    alt: "积木风格的 Lulu 正在桌前使用笔记本电脑",
    eyebrow: "VIBE CODING · ON",
    caption: "把每一个目标，按计划分架构的逐步实现。",
  },
  bike: {
    image: bikeCharacterUrl,
    alt: "积木风格的 Lulu 正在山野骑行山地自行车",
    eyebrow: "RIDE OUTSIDE · GO",
    caption: "走出围城，奔赴山野，方知人间自有清欢。",
  },
  puppy: {
    image: puppyCharacterUrl,
    alt: "积木风格的 Lulu 正在陪伴一只中华田园犬幼犬",
    eyebrow: "SOFT COMPANY · YES",
    caption: "世界破破烂烂，总有小狗缝缝补补。",
  },
  controller: {
    image: controllerCharacterUrl,
    alt: "积木风格的 Lulu 正拿着游戏手柄玩游戏",
    eyebrow: "PLAYER MODE · GO",
    caption: "偶尔暂停现实，去另一个世界闯一闯。",
  },
  coffee: {
    image: coffeeCharacterUrl,
    alt: "积木风格的 Lulu 正捧着一杯爱心拉花咖啡",
    eyebrow: "COFFEE BREAK · YES",
    caption: "浓一点，慢一点，再继续创造。",
  },
};

const defaultState = {
  image: baseCharacterUrl,
  alt: "戴圆框眼镜、穿薄荷色工作服的积木风格 Lulu",
  eyebrow: "BUILDABLE SELF · ALL",
  caption: "我会切换不同的角色状态，去适应不同的环境。",
};

const BrickCharacter = ({ activeItem }) => {
  const state = characterStates[activeItem] ?? defaultState;

  return (
    <figure
      className={`brick-character ${activeItem ? "has-active-state" : ""}`}
      aria-live="polite"
    >
      <span className="brick-character-halo" aria-hidden="true">
        <i />
        <i />
      </span>
      <div className="brick-character-stage">
        <img
          key={state.image}
          src={state.image}
          alt={state.alt}
          draggable="false"
        />
      </div>
      <figcaption>
        <span>{state.eyebrow}</span>
        <strong>{state.caption}</strong>
      </figcaption>
    </figure>
  );
};

export default BrickCharacter;
