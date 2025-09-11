
import { BuiAvatarReact as BuiAvatar } from '@sbddesign/bui-ui/react';
import image from '../assets/avatars/Robot.png';
import image2X from '../assets/avatars/Robot@2x.png';

interface RecipientProps {
  name?: string;
  size?: 'Large' | 'Small';
}

function Recipient({ name = "Recipient Name", size = "Large" }: RecipientProps) {
  const nameElement = (
    <div className="relative shrink-0 text-[#71717b] text-2xl text-center">
      <p className="whitespace-nowrap">{name}</p>
    </div>
  );

  // Map our size prop to bui-ui Avatar size
  const avatarSize = size === "Small" ? "small" : "large";

  if (size === "Small") {
    return (
      <div className="flex flex-col gap-4 items-center justify-start relative w-full" data-name="Size=Small">
        <div className="w-16 h-16" data-name="Avatar" data-node-id="6903:5809">
          <BuiAvatar 
            imageUrl={img}
            size={avatarSize}
          />
        </div>
        {nameElement}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-start relative w-full" data-name="Size=Large">
      <div className="w-40 h-40" data-name="Avatar" data-node-id="6903:5799">
        <BuiAvatar 
          imageUrl={image}
          imageUrl2x={image2X}
          size={avatarSize}
        />
      </div>
      {nameElement}
    </div>
  );
}

export default function RecipientComponent() {
  return (
    <div data-name="Recipient">
      <Recipient />
    </div>
  );
}

export { Recipient };
