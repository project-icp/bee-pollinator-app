# Pollinator Model Terminology

- `HN` – N for nesting; how much do bees like to nest on this sort of land cover?
- `HF` – F for foraging; how much do bees like to forage on this sort of land cover?
- `Pollinator abundance index (P)` – how many bees? We calculate this via an area's `HN` and `HF` coefficients
    - There is also `kappa`in the equations below – a parameter we assume to be constant across all crops. It is the pollinator abundance index that creates 50% of the wild bee-dependent yield, and can also be referred to as the pollinator abundance index
- `Yield` – how much crop? We output yield as a relative percentage amount
   - ie. If your blueberry yield is 45% according to the model, you are currently growing 45% of your full potential blueberry yield. Maybe with bees you can grow 100%
- `Density (n)` – the recommended number of honeybee hives per acre
- `Demand (v)` – the dependence of a crop on bee pollination
   - "can be thought of as how sensitive yield is to the presence of pollinator species ... each crop has a different sensitivity"
- `Managed Hives Per acre (h)` – the user's input
- `<Crop Name> With Cover Crop` – when you grow something else in addition to the main crop
    - eg. an almond orchard with clovers underneath would be in the category "Almond With Cover Crop"

# Crop Yield Function
For a given crop `c`:

`yield_from_managed_honey_bees_c` = `(1 - v_c) + v_c * min(1, h / n_c)`

`yield_from_wild_bees` = `(1 - yield_from_managed_honey_bees_c) * (P / (kappa + P))`

`overall_yield` = `yield_from_managed_honey_bees_c + yield_from_wild_bees`
