import * as React from 'react';
import './style.css';
import PubSub from './pubsub';
import PokemonService from './pokemons.service';

function Publisher() {
  let count = 0;
  const handleClick = () => {
    PubSub.publish('buttonClicked', 'Button in Publisher component clicked!');
  };

  return (
    <div>
      <button onClick={handleClick}>Click Me {count}</button>
    </div>
  );
}

function Subscriber() {
  const [message, setMessage] = React.useState('');
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const subscription = PubSub.subscribe('buttonClicked', (data) => {
      setMessage(data);
    });

    return () => {
      PubSub.unsubscribe(subscription); // Don't forget to unsubscribe when the component unmounts
    };
  }, []);

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
      <p>Message from Publisher: {message}</p>
      <h1>Counter : {count}</h1>
    </div>
  );
}

function App() {
  return (
    <div>
      <Publisher />
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

  // React.useEffect(() => {
  //   const subscription = PubSub.subscribe('counterChanged', (newCount) => {
  //     setCount(newCount);
  //   });

  //   return () => {
  //     PubSub.unsubscribe('counterChanged', subscription);
  //   };
  // }, []);

  return (
    <div>
      {/* <p>Counter: {count}</p> */}
      <button onClick={increment}>Increment</button>
    </div>
  );
}

const Pokemons = () => {
  const [pokemons, setPokemons] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [filterTerm, setFilterTerm] = React.useState('');
  React.useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
      .then((data) => data.json())
      .then(({ results }) => {
        setPokemons(PokemonService.filterAndSort(results, filterTerm));
        setLoading(false);
      });
  }, [filterTerm]);

  React.useEffect(() => {
    PubSub.publish('pokemons', pokemons);
  }, [pokemons, filterTerm]);

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
  const [fullPokemons, setFullPokemons] = React.useState([]);

  React.useEffect(() => {
    const subscription = PubSub.subscribe('pokemons', (pokemons) => {
      setPokemons(pokemons);
    });

    return () => {
      PubSub.unsubscribe('pokemons', subscription);
    };
  }, []);

  React.useEffect(() => {
    setFullPokemons(
      pokemons.map(({ url }) => {
        fetch(url).then((data) => data.json());
      })
    );
  }, [pokemons]);

  console.log(fullPokemons, pokemons);

  return (
    <div>
      <h1>Subscribed pokemons</h1>
      {pokemons.map(({ name }) => (
        <h1 key={name}>{name}</h1>
      ))}
    </div>
  );
};
