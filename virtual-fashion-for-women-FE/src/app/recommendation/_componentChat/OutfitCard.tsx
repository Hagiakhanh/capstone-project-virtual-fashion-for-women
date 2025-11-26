import { Card } from "antd";

interface OutfitCardProps {
  name: string;
  imageUrl: string;
  onSelect?: () => void;
  className?: string;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  name,
  imageUrl,
  onSelect,
  className
}) => (
  <Card
    onClick={onSelect}
    className={"cursor-pointer rounded-xl overflow-hidden bg-[#F9F6F0] shadow-lg hover:shadow-xl transition-shadow "+ className}
    cover={
      <img
        alt={name}
        src={imageUrl}
        className="h-[320px] object-cover w-full"
      />
    }
  >
    <Card.Meta style={{minWidth:"316px"}} description={<div className="text-center w-full">{name}</div>} />
  </Card>
);
