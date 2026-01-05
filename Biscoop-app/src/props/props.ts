export interface ShowProp {
  id: string;
  startDate: Date | undefined;
  endDate: Date |undefined;
  filmId: string;
  roomId: string;
}

export interface ShowPropWithZaal {
    id: string;
    startDate: Date;
    endDate: Date;
    movieId: string;
    zaalId: string;
    zaal: ZaalProp;
}

export interface MovieProp {
  id: string;
  name: string;
  duration: number;
  rating: string;
  genre: string;
  description: string;
}

export interface MoviePropFull {
    id: string;
    name: string;
    duration: number;
    rating: string;
    genre: string;
    description: string;
    shows: ShowPropWithZaal[];
    reviews: Review[];
}

export interface ZaalProp {
  id: string;
  naam: string;
  rijen: number;
  stoelenPerRij: number;
}

export interface ZaalPropFull {
  id: string;
  naam: string;
  rijen: number;
  stoelenPerRij: number;
  shows: ShowProp[]
}

export type Review = {
  id: string;
  name: string;
  description: string;
  rating: number;
  filmId: string;
  userId: string;
};