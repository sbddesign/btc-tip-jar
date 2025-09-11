
import { BuiAvatarReact as BuiAvatar } from '@sbddesign/bui-ui/react';

interface RecipientProps {
  name?: string;
  size?: 'Large' | 'Small';
}

const img = "http://localhost:3845/assets/b3c0566b7a8af090a18c6e79e56002f37d75da5a.png";

function Recipient({ name = "Recipient Name", size = "Large" }: RecipientProps) {
  const nameElement = (
    <div className="font-['Outfit:Regular',_sans-serif] font-normal relative shrink-0 text-[#71717b] text-2xl text-center" data-node-id="6903:5800">
      <p className="whitespace-nowrap">{name}</p>
    </div>
  );

  // Map our size prop to bui-ui Avatar size
  const avatarSize = size === "Small" ? "small" : "large";

  if (size === "Small") {
    return (
      <div className="flex flex-col gap-1 items-center justify-start relative w-full" data-name="Size=Small" data-node-id="6903:5808">
        <div className="w-6 h-6" data-name="Avatar" data-node-id="6903:5809">
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
    <div className="flex flex-col gap-3 items-center justify-start relative w-full" data-name="Size=Large" data-node-id="6903:5805">
      <div className="w-40 h-40" data-name="Avatar" data-node-id="6903:5799">
        <BuiAvatar 
          imageUrl={img}
          size={avatarSize}
        />
      </div>
      {nameElement}
    </div>
  );
}

export default function RecipientComponent() {
  return (
    <div data-name="Recipient" data-node-id="6903:5807">
      <Recipient />
    </div>
  );
}

export { Recipient };
