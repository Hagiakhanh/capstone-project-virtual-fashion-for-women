'use client';

import React from 'react';
import { Statistic } from 'antd';

const { Countdown } = Statistic;

interface CampaignCountdownProps {
  endDate: string | Date;
}

const CampaignCountdown: React.FC<CampaignCountdownProps> = ({ endDate }) => {
  const end = new Date(endDate);

  // Ép thời gian về cuối ngày 23:59:59
  end.setHours(23, 59, 59, 999);

  const deadline = end.getTime();

  return (
    <div className="mt-2">
      <span className="font-semibold mr-2">Kết thúc sau:</span>
      <Countdown
        value={deadline}
        format="DD ngày HH:mm:ss"
        valueStyle={{ color: '#fff', fontSize: 16 }}
        onFinish={() => console.log('Chiến dịch đã kết thúc')}
      />
    </div>
  );
};

export default CampaignCountdown;
