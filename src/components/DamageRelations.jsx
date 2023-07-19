import { useEffect, useState } from "react";
import Type from "./Type";

const DamageRelations = ({ damages }) => {
  // console.log("damages", damages);
  const [damagePokemonForm, setDamagePokemonForm] = useState([]);
  useEffect(() => {
    console.log(Object.entries(damagePokemonForm));
  }, [damagePokemonForm]);

  useEffect(() => {
    const arrayDamage = damages.map((damage) =>
      separateObjectBetweenToAndFrom(damage)
    );

    if (arrayDamage.length === 2) {
      // type이 2개일 때 merge
      const Obj = joinDamageRelations(arrayDamage);
      setDamagePokemonForm(postDamageValue(reduceDuplicateValues(Obj.from)));
    } else {
      // console.log(arrayDamage);
      setDamagePokemonForm(postDamageValue(arrayDamage[0].from));
    }
  }, [damages]);

  const joinDamageRelations = (arrayDamage) => {
    return {
      to: joinObjects(arrayDamage, "to"),
      from: joinObjects(arrayDamage, "from"),
    };
  };

  const reduceDuplicateValues = (props) => {
    const duplicateValues = {
      double_damage: "4x",
      half_damage: "1/4x",
      no_damage: "0x",
    };

    return Object.entries(props).reduce((acc, [keyName, value]) => {
      const key = keyName;
      console.log([keyName, value]);
      const verifiedValue = filterForUniqueValues(value, duplicateValues[key]);
      return (acc = { [keyName]: verifiedValue, ...acc });
    }, {});
  };

  const filterForUniqueValues = (valueForFiltering, damageValue) => {
    // console.log(valueForFiltering, damageValue);
    const result = valueForFiltering.reduce((acc, currentValue) => {
      const { name, url } = currentValue;
      const filterACC = acc.filter((a) => a.name !== name);
      return filterACC.length === acc.length
        ? (acc = [currentValue, ...acc])
        : (acc = [{ damageValue, name, url }, ...filterACC]);
    }, []);
    return result;
  };

  const joinObjects = (arrayDamage, valueFilter) => {
    const key = valueFilter;
    const firstArrayValue = arrayDamage[0][key];
    const secondArrayValue = arrayDamage[1][key];
    // console.log("arrayDamage", arrayDamage);
    // console.log("firstArrayValue", firstArrayValue);
    // console.log("secondArrayValue", secondArrayValue);
    const result = Object.entries(secondArrayValue).reduce(
      (acc, [keyName, value]) => {
        // console.log(acc, [keyName, value]);
        const result = firstArrayValue[keyName].concat(value);

        return (acc = { [keyName]: result, ...acc });
      },
      {}
    );
    // console.log("result", result);
    return result;
  };

  const postDamageValue = (props) => {
    const result = Object.entries(props).reduce((acc, [keyName, value]) => {
      const key = keyName;
      const valueOfKeys = {
        double_damage: "2x",
        half_damage: "1/2x",
        no_damage: "0x",
      };
      // console.log(acc, [keyName, value]);

      return (acc = {
        [keyName]: value.map((i) => ({
          damageValue: valueOfKeys[key],
          ...i,
        })),
        ...acc,
      });
    }, {});
    // console.log(result);
    return result;
  };

  const separateObjectBetweenToAndFrom = (damage) => {
    const from = filterDamageRelations("_from", damage);
    const to = filterDamageRelations("_to", damage);
    // console.log("@@@", from, to);
    return { from, to };
  };

  const filterDamageRelations = (valueFilter, damage) => {
    const result = Object.entries(damage)
      .filter(([keyName, value]) => {
        return keyName.includes(valueFilter);
      })
      .reduce((acc, [keyName, value]) => {
        // console.log(acc, [keyName, value]);
        const keyWithValueFilterRemoved = keyName.replace(valueFilter, "");
        return (acc = { [keyWithValueFilterRemoved]: value, ...acc });
      }, {});
    return result;
  };

  return (
    <div className="flex gap-2 flex-col">
      {damagePokemonForm ? (
        <>
          {Object.entries(damagePokemonForm).map(([keyName, value]) => {
            const key = keyName;
            const valuesOfKeyName = {
              double_damage: "Weak",
              half_damage: "Resistant",
              no_damage: "Immune",
            };

            return (
              <div key={key}>
                <h3 className="capitalize font-medium text-sm md:text-base text-slate-500 text-center mb-3">
                  {valuesOfKeyName[key]}
                </h3>
                <div className="flex flex-wrap gap-1 justify-center">
                  {value.length > 0 ? (
                    value.map(({ name, url, damageValue }) => {
                      return (
                        <Type type={name} key={url} damageValue={damageValue} />
                      );
                    })
                  ) : (
                    <Type type={"none"} key={"none"} />
                  )}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
};
export default DamageRelations;
