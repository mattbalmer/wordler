import * as React from 'react';
import { Recommendation } from './solver';
import { RecommendationCard } from './RecommendationCard';

export const RecommendationList = ({
  recommendations,
  onClick,
}: {
  recommendations: Recommendation[],
  onClick: (recommendation: Recommendation) => void,
}) => {
  return <>
    <ul className='wordler-recommendations-list'>
      {recommendations.map(recommendation =>
        <li onClick={() => onClick(recommendation)} className='wordler-recommendations-list-item' key={recommendation.word} style={{ marginTop: 5 }}>
          <RecommendationCard recommendation={recommendation} />
        </li>
      )}
    </ul>
  </>
}