<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TitleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'boxer_id' => $this->faker->numberBetween(0, 10),
            'organization_id' => $this->faker->numberBetween(0, 10),
            'weight_division_id' => $this->faker->numberBetween(0, 10),
        ];
    }
}
