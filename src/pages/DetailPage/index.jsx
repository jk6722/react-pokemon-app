import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Loading } from "../../assets/Loading";
import { LessThan } from "../../assets/LessThan";
import { GreaterThan } from "../../assets/GreaterThan";
import { ArrowLeft } from "../../assets/ArrowLeft";
import { Balance } from "../../assets/Balance";
import { Vector } from "../../assets/Vector";
import Type from "../../components/Type";
import BaseStat from "../../components/BaseStat";
import DamageRelations from "../../components/DamageRelations";
import DamageModal from "../../components/DamageModal";
import imgUrl from "../../Constant";

const DetailPage = () => {
  const [pokemon, setPokemon] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const pokemonId = params.id;
  const baseUrl = `https://pokeapi.co/api/v2/pokemon/`;
  // console.log(params);

  useEffect(() => {
    setIsLoading(true);
    fetchPokemonData();
  }, [pokemonId]);

  async function fetchPokemonData() {
    const url = `${baseUrl}${pokemonId}`;
    try {
      const { data: pokemonData } = await axios.get(url);
      // console.log(pokemonData);
      if (pokemonData) {
        const { name, id, types, weight, height, stats, abilities, sprites } =
          pokemonData;
        const nextAndPreviousPokemon = await getNextAndPreviousPokemon(id);
        // console.log(nextAndPreviousPokemon);
        // console.log(stats);
        // console.log(abilities);
        // console.log(sprites);

        const DamageRelations = await Promise.all(
          types.map(async (i) => {
            // console.log("i", i);
            const type = await axios.get(i.type.url); // 각 타입에 대한 상세 정보를 가져오는 url
            // console.log("type", type);
            return type.data.damage_relations;
          })
        );

        const formattedPokemonData = {
          id,
          name,
          weight: weight / 10,
          height: height / 10,
          types: types.map((type) => type.type.name),
          previous: nextAndPreviousPokemon.previous,
          next: nextAndPreviousPokemon.next,
          abilities: formatPokemonAbilities(abilities),
          stats: formatPokemonStats(stats),
          damageRelations: DamageRelations,
          sprites: formatPokemonSprites(sprites),
          description: await getPokemonDescription(id),
        };
        // console.log("formatted", formattedPokemonData);
        // console.log(formattedPokemonData.description);
        setPokemon(formattedPokemonData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  const filterAndFormatDescription = (flavorText) => {
    const koreanDescriptions = flavorText
      .filter((text) => text.language.name === "ko")
      .map((text) => text.flavor_text.replace(/\r|\n|\f/g, " "));
    // console.log(koreanDescriptions);
    return koreanDescriptions;
  };

  const getPokemonDescription = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;

    const { data: pokemonSpecies } = await axios.get(url);
    // console.log(pokemonSpecies);
    const descriptions = filterAndFormatDescription(
      pokemonSpecies.flavor_text_entries
    );

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const formatPokemonSprites = (sprites) => {
    const newSprites = { ...sprites }; // 불변성 지키기
    Object.keys(newSprites).forEach((key) => {
      if (typeof newSprites[key] !== "string") {
        delete newSprites[key];
      }
    });
    // console.log(Object.values(newSprites));
    return Object.values(newSprites);
  };

  async function getNextAndPreviousPokemon(id) {
    const urlPokemon = `${baseUrl}?limit=1&offset=${id - 1}`;

    const { data: pokemonData } = await axios.get(urlPokemon);
    // console.log(pokemonData);

    const nextResponse =
      pokemonData.next && (await axios.get(pokemonData.next));
    const previousResponse =
      pokemonData.previous && (await axios.get(pokemonData.previous));

    // console.log("prev", previousResponse);

    return {
      next: nextResponse?.data?.results?.[0]?.name,
      previous: previousResponse?.data?.results?.[0]?.name,
    };
  }

  const formatPokemonAbilities = (Abilities) => {
    return Abilities.filter((_, index) => index <= 1).map((obj) =>
      obj.ability.name.replaceAll("-", " ")
    );
  };

  const formatPokemonStats = ([
    statHP,
    statATK,
    statDEF,
    statSATK,
    statSDEP,
    statSPD,
  ]) => [
    { name: "Hit Point", baseStat: statHP.base_stat },
    { name: "Attack", baseStat: statATK.base_stat },
    { name: "Defense", baseStat: statDEF.base_stat },
    { name: "Special Attack", baseStat: statSATK.base_stat },
    { name: "Special Defence", baseStat: statSDEP.base_stat },
    { name: "Speed", baseStat: statSPD.base_stat },
  ];

  if (isLoading) {
    return (
      <div
        className={`absolute h-auto w-auto top-1/3 -translate-x-1/2 left-1/2 z-50`}
      >
        <Loading className={`w-12 h-12 z-50 animate-spin text-slate-800`} />
      </div>
    );
  }

  if (!isLoading && !pokemon) {
    return <div>Not Found...</div>;
  }

  const img = `${imgUrl}${pokemon?.id}.png`;

  const bg = `bg-${pokemon?.types?.[0]}`;
  const text = `text-${pokemon?.types?.[0]}`;

  // console.log(bg, text);
  // console.log(pokemon?.damageRelations);

  return (
    <article className={`flex items-center gap-1 flex-col w-full`}>
      <div
        className={`${bg} w-auto h-full flex flex-col z-0 items-center justify-end relative overflow-hidden`}
      >
        {pokemon.previous && (
          <Link
            className="absolute top-[40%] -translate-y-1/2 z-50 left-1"
            to={`/pokemon/${pokemon.previous}`}
          >
            <LessThan className="w-5 h-8 p-1" />
          </Link>
        )}
        {pokemon.next && (
          <Link
            className="absolute top-[40%] -translate-y-1/2 z-50 right-1"
            to={`/pokemon/${pokemon.next}`}
          >
            <GreaterThan className="w-5 h-8 p-1" />
          </Link>
        )}

        <section className="w-full flex flex-col z-20 items-center justify-end relative h-full">
          <div className="absolute z-30 top-6 flex items-center w-full justify-between px-2">
            <div className="flex items-center gap-1">
              <Link to="/">
                <ArrowLeft className="w-6 h-8 text-zinc-200 " />
              </Link>
              <h1 className="text-zinc-200 font-bold text-xl capitalize">
                {pokemon.name}
              </h1>
            </div>
            <div className="text-zinc-200 font-bold text-medium">
              #{pokemon.id?.toString().padStart(3, "00")}
            </div>
          </div>

          <div className="relative h-auto max-w-[15.5rem] z-20 mt-6 -mb-16">
            <img
              src={img}
              alt={pokemon.name}
              width="100%"
              height="auto"
              loading="lazy"
              className={`object-contain h-full`}
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          </div>
        </section>

        <section className="w-full min-h-[65%] h-full bg-gray-800 z-10 pt-14 flex flex-col items-center gap-3 px-5 pb-4">
          <div className="flex -items-center justify-center gap-4">
            {/*포켓몬 타입*/}
            {pokemon.types.map((type) => (
              <Type key={type} type={type}></Type>
            ))}
          </div>
          <h2 className={`text-base font-semibold ${text}`}>정보</h2>
          <div className="flex w-full items-center justify-between max-w-[400px] text-center">
            <div className="w-full">
              <h4 className="text-[0.5rem] text-zinc-100">Weight</h4>
              <div className="text-sm text-zinc-200 flex mt-1 gap-2 justify-center">
                <Balance />
                {pokemon.weight}kg
              </div>
            </div>
            <div className="w-full">
              <h4 className="text-[0.5rem] text-zinc-100">Height</h4>
              <div className="text-sm text-zinc-200 flex mt-1 gap-2 justify-center">
                <Vector />
                {pokemon.height}m
              </div>
            </div>
            <div className="w-full">
              <h4 className="text-[0.5rem] text-zinc-100">Abilities</h4>
              <div className="text-sm text-zinc-200 flex mt-1 gap-2 justify-center">
                {pokemon.abilities.map((ability, _) => (
                  <div
                    key={ability}
                    className="text-[0.5rem] text-zinc-100 capitalize"
                  >
                    {ability}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <h2 className={`text-base font-semibold ${text}`}>기본 능력치</h2>
          <div className="w-full">
            <table>
              <tbody>
                {pokemon.stats.map((stat) => (
                  <BaseStat
                    key={stat.name}
                    valueStat={stat.baseStat}
                    nameStat={stat.name}
                    type={pokemon.types[0]}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <h2 className={`text-base font-semibold ${text}`}>설명</h2>
          <p
            className={`text-md leading-4 font-sans text-zinc-200 max-w-[30rem] text-center`}
          >
            {pokemon?.description}
          </p>
          <div className="flex my-8 flex-wrap justify-center">
            {pokemon.sprites.map((url) => (
              <img src={url} key={url} alt="sprites" />
            ))}
          </div>
        </section>
      </div>
      {isModalOpen && (
        <DamageModal
          damages={pokemon.damageRelations}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </article>
  );
};

export default DetailPage;
