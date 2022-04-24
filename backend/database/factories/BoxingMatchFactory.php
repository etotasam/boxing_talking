<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BoxingMatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'red_fighter_id' => $this->faker->numberBetween(0,100),
            'blue_fighter_id' => $this->faker->numberBetween(0,100),
            'match_date' => $this->faker->dateTimeBetween('now', '+3months')->format('Y-m-d'),
            'count_red' => $this->faker->numberBetween(0, 100),
            'count_blue' => $this->faker->numberBetween(0, 100),
        ];
    }
}
