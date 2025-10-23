import { Card } from "antd";

interface OutfitCardProps {
  name: string;
  imageUrl: string;
  onSelect?: () => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  name,
  imageUrl,
  onSelect,
}) => (
  <Card
    onClick={onSelect}
    className="cursor-pointer rounded-xl overflow-hidden bg-[#F9F6F0] shadow-lg hover:shadow-xl transition-shadow"
    cover={
      <img
        alt={name}
        src={imageUrl}
        className="h-[320px] object-cover w-full"
      />
    }
  >
    <Card.Meta description={<div className="text-center">{name}</div>} />
  </Card>
);
