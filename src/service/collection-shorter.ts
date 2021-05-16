import { chain, forEach, map, merge, uniq, uniqBy } from 'lodash';
import { sep } from 'path';

export default class CollectionShorter {
  public static short(list: string[], separator: string = sep): string[] {
    const uniques = CollectionShorter.shortMap(list, separator);

    return map(list, (path: string) => uniques[path]);
  }

  public static shortMap(
    list: string[],
    separator: string = sep
  ): ShortMapCollection {
    if (uniq(list).length < list.length) {
      console.log(list);
      throw Error('Not unique paths');
    }

    const listCompared: {
      [key: string]: string[];
    } = {};
    forEach(list, (path: string) => {
      const name = path.split(separator).pop();
      if (name) {
        if (name in listCompared) {
          listCompared[name].push(path);
        } else {
          listCompared[name] = [path];
        }
      }
    });

    let uniques: { [key: string]: string } = {};
    forEach(listCompared, (paths: string[]) => {
      for (let i = -1; i >= -20; i--) { // TODO
        const pathsMapped = paths.map((path: string) => ({
          path,
          short: path.split(separator).slice(i).join(separator),
        }));
        if (uniqBy(pathsMapped, 'short').length === paths.length) {
          uniques = merge(
            uniques,
            chain(pathsMapped).keyBy('path').mapValues('short').value()
          );
          break;
        }
      }
    });

    return uniques;
  }
}

export type ShortMapCollection = { [key: string]: string };
