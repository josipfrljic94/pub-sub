// FilteringAndSortingService.js
class PokemonService {
  filterAndSort(pokemons, filterTerm) {
    let filteredAndSorted = [...pokemons];

    if (filterTerm) {
      filteredAndSorted = filteredAndSorted.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(filterTerm.toLowerCase())
      );
    }

    return filteredAndSorted;
  }
}

export default new PokemonService();
