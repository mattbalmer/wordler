import * as React from 'react';
import { Recommendation } from './solver';

export const RecommendationCard = ({
  recommendation,
}: {
  recommendation: Recommendation,
}) => {
  // todo context
  return <div style={{}}>
    <p>{recommendation.word} <span style={{color: '#999'}}>({recommendation.infoScore})</span></p>
  </div>
}