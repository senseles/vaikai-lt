import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const cityNames: Record<string, string> = {
  vilnius: 'Vilnius', kaunas: 'Kaunas', klaipeda: 'Klaipėda',
  siauliai: 'Šiauliai', panevezys: 'Panevėžys', palanga: 'Palanga',
  silute: 'Šilutė', taurage: 'Tauragė', telsiai: 'Telšiai',
  mazeikiai: 'Mažeikiai', kedainiai: 'Kėdainiai', marijampole: 'Marijampolė',
  utena: 'Utena', alytus: 'Alytus', jonava: 'Jonava',
  visaginas: 'Visaginas', druskininkai: 'Druskininkai', elektrenai: 'Elektrėnai',
  ukmerge: 'Ukmergė', akmene: 'Akmenė', anyksciai: 'Anykščiai',
  birzai: 'Biržai', ignalina: 'Ignalina', joniskis: 'Joniškis',
  jurbarkas: 'Jurbarkas', kaisiadorys: 'Kaišiadorys', kelme: 'Kelmė',
  kretinga: 'Kretinga', kupiskis: 'Kupiškis', lazdijai: 'Lazdijai',
  moletai: 'Molėtai', pakruojis: 'Pakruojis', pasvalys: 'Pasvalys',
  plunge: 'Plungė', prienai: 'Prienai', radviliskis: 'Radviliškis',
  raseiniai: 'Raseiniai', rokiskis: 'Rokiškis', trakai: 'Trakai',
  varena: 'Varėna', vilkaviskis: 'Vilkaviškis', zarasai: 'Zarasai',
  sakiai: 'Šakiai',
};

export default async function Image({ params }: { params: { city: string } }) {
  const cityName = cityNames[params.city] ?? params.city;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              textAlign: 'center',
              padding: '0 60px',
            }}
          >
            {cityName}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.85)',
              textAlign: 'center',
              padding: '0 60px',
            }}
          >
            Vaikai.lt — Darželiai, auklės, būreliai
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
