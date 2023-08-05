import * as React from 'react';
import './style.css';
import PubSub from './pubsub';
import PokemonService from './pokemons.service';
import { IPokemon } from './pokemon.interface';

function Subscriber() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const subscription = PubSub.subscribe('counterChanged', (newCount) => {
      setCount(newCount);
    });

    return () => {
      PubSub.unsubscribe('counterChanged', subscription);
    };
  }, []);

  return (
    <div>
      <h1>Pokemons number + Counter : {count}</h1>
    </div>
  );
}

function App() {
  return (
    <div>
      <Subscriber />
      <Counter />
      <Pokemons />
      <PokemonReceiver />
    </div>
  );
}

export default App;

function Counter() {
  const [count, setCount] = React.useState(0);

  const increment = () => {
    setCount(count + 1);
    PubSub.publish('counterChanged', count + 1);
  };

  React.useEffect(() => {
    const subscription = PubSub.subscribe('counterChanged', (newCount) => {
      setCount(newCount);
    });

    return () => {
      PubSub.unsubscribe('counterChanged', subscription);
    };
  }, []);

  return (
    <div>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

const Pokemons = () => {
  const [pokemons, setPokemons] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [filterTerm, setFilterTerm] = React.useState('');
  React.useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0')
      .then((data) => data.json())
      .then(({ results }) => {
        setPokemons(PokemonService.filterAndSort(results, filterTerm));
        setLoading(false);
      });
  }, [filterTerm]);

  React.useEffect(() => {
    PubSub.publish('pokemons', pokemons);
  }, [pokemons, filterTerm]);

  console.log({ pokemons });

  if (isLoading) return <h1>Loading...</h1>;
  return (
    <div>
      <input
        type="text"
        placeholder="Filter by name"
        value={filterTerm}
        onChange={(e) => setFilterTerm(e.target.value)}
      />
    </div>
  );
};

const PokemonReceiver = () => {
  const [pokemons, setPokemons] = React.useState([]);
  const [fullPokemons, setFullPokemons] = React.useState<IPokemon[]>([]);

  React.useEffect(() => {
    const subscription = PubSub.subscribe('pokemons', (pokemons) => {
      setPokemons(pokemons);
      PubSub.publish('counterChanged', pokemons.length);
    });

    return () => {
      PubSub.unsubscribe('pokemons', subscription);
    };
  }, []);

  React.useEffect(() => {
    if (pokemons.length === 0) return;

    const fetchFullPokemons = async () => {
      const pokemonDetailsPromises = pokemons.map(({ url }) => {
        return fetch(url).then((data) => data.json());
      });

      const fullPokemonData = await Promise.all(pokemonDetailsPromises);
      // console.log(fullPokemonData, 'data');
      setFullPokemons(fullPokemonData);
    };

    fetchFullPokemons();
  }, [pokemons]);

  // console.log(fullPokemons);

  return (
    <div>
      <div className="container">
        {fullPokemons.map(({ sprites, name }) => (
          <div className="card">
            <img src={sprites.front_default} />
            <h1>{name}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};
