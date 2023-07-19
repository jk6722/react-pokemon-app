import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import PokeCard from "./components/PokeCard";
import { useDebounce } from "./hooks/useDebounce";

function App() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [pokemons, setPokemons] = useState([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchPokeData(true);
  }, []);

  useEffect(() => {
    handleSearchInput(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const fetchPokeData = async (isFirstFetch) => {
    try {
      const offsetValue = isFirstFetch ? 0 : offset + limit;
      const url = `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offsetValue}`;

      const response = await axios.get(url);

      if (isFirstFetch) {
        setPokemons(response.data.results);
      } else {
        setPokemons([...pokemons, ...response.data.results]);
      }
      setOffset(offsetValue);

      // console.log(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchInput = async (searchTerm) => {
    if (searchTerm.length > 0) {
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${searchTerm}`
        );
        const pokemonData = {
          url: `https://pokeapi.co/api/v2/pokemon/${response.data.id}`,
          name: searchTerm,
        };
        setPokemons([pokemonData]);
      } catch (error) {
        setPokemons([]);
        console.log(error);
      }
    } else {
      setPokemons([]);
      fetchPokeData(true);
    }
  };

  return (
    <article className="pt-6">
      <header className="flex flex-col gap-2 w-full px-4 z-50">
        <div className="relative z-50">
          <form
            action=""
            className="relative flex jusify-center items-center w-[20.5rem] h-6 rounded-lg m-auto"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="text-xs w-[20.5rem] h-6 px-2 py-1 rounded-lg bg-[hsl(214,13%,47%)] text-gray-300 text-center"
            />
            <button
              type="submit"
              className="text-xs bg-slate-900 text-slate-300 w-[2.5rem] h-6 px-2 py-1 rounded-r-lg text-center absolute right-0 hover:bg-slate-700"
            >
              검색
            </button>
          </form>
        </div>
      </header>
      <section className="pt-6 flex flex-col justify-content items-center overflow-auto z-0">
        <div className="flex flex-row flex-wrap gap-[16px] items-center justify-center px-2 max-w-4xl">
          {pokemons.length > 0 ? (
            pokemons.map(({ url, name }, index) => (
              <div key={url}>
                <PokeCard url={url} name={name}>
                  {name}
                </PokeCard>
              </div>
            ))
          ) : (
            <h2 className="font-medium text-lg text-slate-900 mb-1">
              포켓몬이 없습니다.
            </h2>
          )}
        </div>
      </section>
      <div className="text-center">
        <button
          className={`bg-slate-800 px-6 py-2 my-4 text-base rounded-lg font-bold text-white`}
          onClick={() => {
            if (!searchTerm) fetchPokeData(false);
          }}
        >
          더보기
        </button>
      </div>
    </article>
  );
}

export default App;
