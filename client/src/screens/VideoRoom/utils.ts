/**
 * Utility functions for VideoRoom component
 */

export interface GridLayout {
  columns: string;
  rows: string;
  aspectRatio: string;
}

/**
 * Calculates the optimal grid layout based on the number of participants
 * Optimized for mobile and desktop views
 */
export const getGridLayout = (participantCount: number): GridLayout => {
  if (participantCount === 1) {
    return {
      columns: "1fr",
      rows: "1fr",
      aspectRatio: "16/9",
    };
  } else if (participantCount === 2) {
    return {
      columns: "1fr 1fr",
      rows: "1fr",
      aspectRatio: "16/9",
    };
  } else if (participantCount <= 4) {
    return {
      columns: "1fr 1fr",
      rows: "1fr 1fr",
      aspectRatio: "16/9",
    };
  } else if (participantCount <= 6) {
    return {
      columns: "1fr 1fr 1fr",
      rows: "1fr 1fr",
      aspectRatio: "16/9",
    };
  } else if (participantCount <= 9) {
    return {
      columns: "1fr 1fr 1fr",
      rows: "1fr 1fr 1fr",
      aspectRatio: "16/9",
    };
  } else {
    return {
      columns: "repeat(4, 1fr)",
      rows: "repeat(3, 1fr)",
      aspectRatio: "16/9",
    };
  }
};

